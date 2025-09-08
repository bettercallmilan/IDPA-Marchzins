const langButtons = {
    de: document.getElementById('de-btn'),
    en: document.getElementById('en-btn')
};

const inputFields = {
    birthday: document.getElementById('birthday'),
    capital: document.getElementById('capital'),
    regularRate: document.getElementById('regular-rate'),
    bonusRate: document.getElementById('bonus-rate'),
    taxRate: document.getElementById('tax-rate')
};

const errorMessages = {
    birthday: document.getElementById('birthday-error'),
    capital: document.getElementById('capital-error'),
    regularRate: document.getElementById('regular-rate-error'),
    bonusRate: document.getElementById('bonus-rate-error'),
    taxRate: document.getElementById('tax-rate-error')
};

const resultFields = {
    container: document.getElementById('results-container'),
    periodValue: document.getElementById('period-value'),
    daysValue: document.getElementById('days-value'),
    regularInterestValue: document.getElementById('regular-interest-value'),
    bonusInterestValue: document.getElementById('bonus-interest-value'),
    grossTotalValue: document.getElementById('gross-total-value'),
    taxAmountValue: document.getElementById('tax-amount-value'),
    netTotalValue: document.getElementById('net-total-value')
};

const buttons = {
    calculate: document.getElementById('calculate-btn'),
    reset: document.getElementById('reset-btn')
};

const errorText = {
    birthdayRequired: "Please enter a date of birth.",
    birthdayInvalid: "Please enter a valid date of birth.",
    birthdayFuture: "Date of birth cannot be in the future.",
    capitalRequired: "Please enter the savings capital.",
    capitalPositive: "Savings capital must be positive.",
    rateInvalid: "Interest rate must be between 0 and 10%.",
    taxInvalid: "Tax must be between 0 and 100%."
};

document.addEventListener('DOMContentLoaded', () => {
    langButtons.de.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    langButtons.en.addEventListener('click', () => {
        window.location.href = 'index-en.html';
    });
    
    buttons.calculate.addEventListener('click', calculateBonus);
    buttons.reset.addEventListener('click', resetCalculator);
    
    loadSavedSettings();
});

function validateInputs() {
    let isValid = true;
    clearErrors();
    
    if (!inputFields.birthday.value) {
        showError('birthday', errorText.birthdayRequired);
        isValid = false;
    } else {
        const birthDate = new Date(inputFields.birthday.value);
        if (isNaN(birthDate.getTime())) {
            showError('birthday', errorText.birthdayInvalid);
            isValid = false;
        } else if (birthDate > new Date()) {
            showError('birthday', errorText.birthdayFuture);
            isValid = false;
        }
    }
    
    if (!inputFields.capital.value) {
        showError('capital', errorText.capitalRequired);
        isValid = false;
    } else if (parseFloat(inputFields.capital.value) <= 0) {
        showError('capital', errorText.capitalPositive);
        isValid = false;
    }
    
    const regularRate = parseFloat(inputFields.regularRate.value);
    const bonusRate = parseFloat(inputFields.bonusRate.value);
    const taxRate = parseFloat(inputFields.taxRate.value);
    
    if (isNaN(regularRate) || regularRate < 0 || regularRate > 10) {
        showError('regularRate', errorText.rateInvalid);
        isValid = false;
    }
    
    if (isNaN(bonusRate) || bonusRate < 0 || bonusRate > 10) {
        showError('bonusRate', errorText.rateInvalid);
        isValid = false;
    }
    
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        showError('taxRate', errorText.taxInvalid);
        isValid = false;
    }
    
    return isValid;
}

function showError(fieldName, message) {
    errorMessages[fieldName].textContent = message;
}

function clearErrors() {
    for (const field in errorMessages) {
        errorMessages[field].textContent = '';
    }
}

function calculateBonus() {
    if (!validateInputs()) return;
    
    const birthday = new Date(inputFields.birthday.value);
    const capital = parseFloat(inputFields.capital.value);
    const regularRate = parseFloat(inputFields.regularRate.value) / 100;
    const bonusRate = parseFloat(inputFields.bonusRate.value) / 100;
    const taxRate = parseFloat(inputFields.taxRate.value) / 100;
    
    saveSettings();
    
    const currentDate = new Date();
    
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const birthdayThisYear = new Date(currentDate.getFullYear(), birthday.getMonth(), birthday.getDate());
    
    let bonusStartDate = firstDayOfMonth;
    let bonusEndDate = birthdayThisYear;
    
    if (birthdayThisYear < currentDate) {
        bonusStartDate = new Date(currentDate.getFullYear() + 1, birthday.getMonth(), 1);
        bonusEndDate = new Date(currentDate.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
    } else if (birthday.getMonth() !== currentDate.getMonth()) {
        bonusStartDate = new Date(currentDate.getFullYear(), birthday.getMonth(), 1);
    }
    
    const oneDayMs = 24 * 60 * 60 * 1000;
    const bonusDays = Math.round((bonusEndDate - bonusStartDate) / oneDayMs) + 1;
    const daysInYear = isLeapYear(currentDate.getFullYear()) ? 366 : 365;
    
    const regularInterest = capital * regularRate * bonusDays / daysInYear;
    const bonusInterest = capital * bonusRate * bonusDays / daysInYear;
    const grossTotal = regularInterest + bonusInterest;
    const taxAmount = grossTotal * taxRate;
    const netTotal = grossTotal - taxAmount;
    
    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB');
    };
    
    const periodText = `${formatDate(bonusStartDate)} - ${formatDate(bonusEndDate)}`;
    
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'CHF'
        }).format(amount);
    };
    
    resultFields.container.classList.remove('hidden');
    resultFields.periodValue.textContent = periodText;
    resultFields.daysValue.textContent = bonusDays;
    resultFields.regularInterestValue.textContent = formatMoney(regularInterest);
    resultFields.bonusInterestValue.textContent = formatMoney(bonusInterest);
    resultFields.grossTotalValue.textContent = formatMoney(grossTotal);
    resultFields.taxAmountValue.textContent = formatMoney(taxAmount);
    resultFields.netTotalValue.textContent = formatMoney(netTotal);
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function resetCalculator() {
    inputFields.birthday.value = '';
    inputFields.capital.value = '';
    
    clearErrors();
    
    resultFields.container.classList.add('hidden');
}

function saveSettings() {
    const settings = {
        regularRate: inputFields.regularRate.value,
        bonusRate: inputFields.bonusRate.value,
        taxRate: inputFields.taxRate.value
    };
    
    localStorage.setItem('marchzinsSettings', JSON.stringify(settings));
}

function loadSavedSettings() {
    const savedSettings = localStorage.getItem('marchzinsSettings');
    
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        inputFields.regularRate.value = settings.regularRate || 0.25;
        inputFields.bonusRate.value = settings.bonusRate || 1.0;
        inputFields.taxRate.value = settings.taxRate || 35;
    }
}