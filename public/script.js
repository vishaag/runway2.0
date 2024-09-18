document.addEventListener('DOMContentLoaded', () => {
  let selectedCurrency = { symbol: '₹', code: 'INR' }; // Default currency symbol and code
  let chart;

  // Function to save data to local storage
  function saveToLocalStorage() {
    const data = {
      currency: document.getElementById('currency').value,
      networth: document.getElementById('networth').value.replace(/,/g, ''),
      monthlyExpenses: document.getElementById('monthly_expenses').value.replace(/,/g, ''),
      monthlyIncome: document.getElementById('monthly_income').value.replace(/,/g, ''),
      returnRate: document.getElementById('return_rate').value,
      inflation: document.getElementById('inflation').value,
      tableData: document.getElementById('projectionTableBody').innerHTML,
      chartData: chart ? chart.data : null
    };
    localStorage.setItem('financialRunwayData', JSON.stringify(data));
  }

  // Function to load data from local storage or set default values
  function loadFromLocalStorageOrSetDefaults() {
    const storedData = localStorage.getItem('financialRunwayData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        
        // Check if all required fields are present
        const requiredFields = ['currency', 'networth', 'monthlyExpenses', 'monthlyIncome', 'returnRate', 'inflation'];
        const allFieldsPresent = requiredFields.every(field => data.hasOwnProperty(field));
        
        if (allFieldsPresent) {
          document.getElementById('currency').value = data.currency;
          selectedCurrency.code = data.currency;
          
          // Remove commas and parse as float before formatting
          const networth = parseFloat(data.networth.replace(/,/g, ''));
          const monthlyExpenses = parseFloat(data.monthlyExpenses.replace(/,/g, ''));
          const monthlyIncome = parseFloat(data.monthlyIncome.replace(/,/g, ''));
          
          if (data.currency === 'INR') {
            document.getElementById('networth').value = formatIndianNumber(networth.toFixed(0));
            document.getElementById('monthly_expenses').value = formatIndianNumber(monthlyExpenses.toFixed(0));
            document.getElementById('monthly_income').value = formatIndianNumber(monthlyIncome.toFixed(0));
          } else {
            document.getElementById('networth').value = networth.toLocaleString('en-US');
            document.getElementById('monthly_expenses').value = monthlyExpenses.toLocaleString('en-US');
            document.getElementById('monthly_income').value = monthlyIncome.toLocaleString('en-US');
          }
          
          document.getElementById('return_rate').value = data.returnRate;
          document.getElementById('inflation').value = data.inflation;
          
          // Check if all required table columns are present
          const requiredColumns = ['Year', 'Annual Income', 'Withdrawal', 'Networth'];
          const tableHeader = document.querySelector('thead tr');
          const existingColumns = Array.from(tableHeader.children).map(th => th.textContent.trim());
          const allColumnsPresent = requiredColumns.every(col => existingColumns.includes(col));
          
          if (allColumnsPresent && data.tableData) {
            document.getElementById('projectionTableBody').innerHTML = data.tableData;
          } else {
            console.log('Table structure has changed. Recreating projection table.');
            updateProjectionTable();
          }

          if (data.chartData) {
            createChart(data.chartData.labels, data.chartData.datasets[0].data);
          } else {
            updateProjectionTable(); // Create new projection if chart data is missing
          }

          toggleIncomeColumn(monthlyIncome > 0);
        } else {
          console.log('Some fields are missing in stored data. Using default values.');
          setDefaultValues();
        }
      } catch (error) {
        console.error('Error parsing stored data:', error);
        setDefaultValues();
      }
    } else {
      setDefaultValues();
    }
  }

  // Helper function to set default values
  function setDefaultValues() {
    document.getElementById('currency').value = 'INR';
    document.getElementById('networth').value = '10,000,000';
    document.getElementById('monthly_expenses').value = '75,000';
    document.getElementById('monthly_income').value = '0';
    document.getElementById('return_rate').value = '8';
    document.getElementById('inflation').value = '6';

    // Format default values based on selected currency
    if (selectedCurrency.code === 'INR') {
      document.getElementById('networth').value = formatIndianNumber(10000000);
      document.getElementById('monthly_expenses').value = formatIndianNumber(75000);
      document.getElementById('monthly_income').value = formatIndianNumber(0);
    } else {
      document.getElementById('networth').value = (10000000).toLocaleString('en-US');
      document.getElementById('monthly_expenses').value = (75000).toLocaleString('en-US');
      document.getElementById('monthly_income').value = (0).toLocaleString('en-US');
    }
    
    // Update the projection table and chart with default values
    updateProjectionTable();

    toggleIncomeColumn(false); // Hide income column by default
  }

  // Fetch currencies from JSON file
  fetch('/currency.json')
    .then(response => response.json())
    .then(currencyData => {
      const currencies = Object.entries(currencyData).map(([code, data]) => ({
        code,
        name: data.name,
        symbol: data.symbol
      }));

      // Populate currency select
      const currencySelect = document.getElementById('currency');
      currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.code;
        option.textContent = `${currency.code} - ${currency.name} (${currency.symbol})`;
        currencySelect.appendChild(option);
      });

      // Update currency symbol
      function updateCurrencySymbol() {
        selectedCurrency = currencies.find(c => c.code === currencySelect.value) || selectedCurrency;
        document.querySelectorAll('.currency-symbol').forEach(span => {
          span.textContent = selectedCurrency.symbol;
        });

        // Reformat the input fields based on the new currency
        const networthInput = document.getElementById('networth');
        const monthlyExpensesInput = document.getElementById('monthly_expenses');
        const monthlyIncomeInput = document.getElementById('monthly_income');

        const formatInput = (input) => {
          const value = parseFloat(input.value.replace(/,/g, ''));
          if (!isNaN(value)) {
            if (selectedCurrency.code === 'INR') {
              input.value = formatIndianNumber(value.toFixed(0));
            } else {
              input.value = value.toLocaleString('en-US');
            }
          }
        };

        formatInput(networthInput);
        formatInput(monthlyExpensesInput);
        formatInput(monthlyIncomeInput);
      }

      currencySelect.addEventListener('change', () => {
        updateCurrencySymbol();
        updateProjectionTable();
        saveToLocalStorage();
      });

      // Load data from local storage or set defaults after populating currency options
      loadFromLocalStorageOrSetDefaults();
      
      // Update currency symbol after loading data
      updateCurrencySymbol();
      
      // If no data was loaded, set initial currency symbol
      if (!localStorage.getItem('financialRunwayData')) {
        updateCurrencySymbol();
      }
    })
    .catch(error => console.error('Error loading currencies:', error));

  // Function to format number input with commas
  const formatNumberInput = (input) => {
    // Remove existing commas and non-numeric characters (except decimal point)
    let value = input.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
    
    // Split the value into integer and decimal parts
    let parts = value.split('.');
    
    // Format the integer part with commas
    if (selectedCurrency.code === 'INR') {
      parts[0] = formatIndianNumber(parts[0]);
    } else {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Limit decimal places to 2
    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, 2);
    }
    
    // Join the parts back together
    input.value = parts.join('.');
  };

  // Add event listeners to all numeric inputs
  const numericInputs = document.querySelectorAll('input[inputmode="numeric"]');
  numericInputs.forEach(input => {
    input.addEventListener('input', () => {
      formatNumberInput(input);
      saveToLocalStorage();
    });
  });

  // Form submission
  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate inputs
    const networth = parseFormattedNumber(document.getElementById('networth').value);
    const monthlyExpenses = parseFormattedNumber(document.getElementById('monthly_expenses').value);
    const monthlyIncome = parseFormattedNumber(document.getElementById('monthly_income').value);
    const returnRate = parseFloat(document.getElementById('return_rate').value);
    const inflation = parseFloat(document.getElementById('inflation').value);

    if (isNaN(networth) || isNaN(monthlyExpenses) || isNaN(monthlyIncome) || isNaN(returnRate) || isNaN(inflation)) {
      alert('Please enter valid numbers for all fields.');
      return;
    }

    if (returnRate < 0 || returnRate > 100 || inflation < 0 || inflation > 100) {
      alert('Return rate and inflation should be between 0 and 100.');
      return;
    }

    updateProjectionTable();
    saveToLocalStorage();
  });

  // Function to update the projection table and chart
  function updateProjectionTable() {
    const tableBody = document.getElementById('projectionTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    // Get input values and remove commas before parsing
    const initialNetworth = parseFloat(document.getElementById('networth').value.replace(/,/g, ''));
    const monthlyExpenses = parseFloat(document.getElementById('monthly_expenses').value.replace(/,/g, ''));
    const monthlyIncome = parseFloat(document.getElementById('monthly_income').value.replace(/,/g, ''));
    const annualExpenses = monthlyExpenses * 12; // Calculate annual expenses
    const annualIncome = monthlyIncome * 12; // Calculate annual income
    const returnRate = parseFloat(document.getElementById('return_rate').value) / 100;
    const inflation = parseFloat(document.getElementById('inflation').value) / 100;

    const showIncomeColumn = monthlyIncome > 0;
    toggleIncomeColumn(showIncomeColumn);

    const maxYears = 100;
    const data = [];
    const labels = [];

    let currentNetworth = initialNetworth;
    let currentWithdrawal = annualExpenses;
    let currentIncome = annualIncome;

    const rows = [];

    for (let year = 1; year <= maxYears; year++) {
      // Calculate net cash flow (income - expenses)
      const netCashFlow = currentIncome - currentWithdrawal;
      
      // Update networth based on cash flow
      currentNetworth += netCashFlow;
      
      // If networth becomes negative, stop the projection
      if (currentNetworth < 0) {
        break;
      }
      
      // Apply investment returns
      currentNetworth = currentNetworth * (1 + returnRate);

      const row = document.createElement('tr');
      // Add color coding based on networth comparison
      if (currentNetworth > initialNetworth) {
        row.classList.add('bg-green-100');
      } else if (currentNetworth < initialNetworth) {
        row.classList.add('bg-yellow-100');
      }

      let formattedIncome, formattedWithdrawal, formattedNetworth;
      if (selectedCurrency.code === 'INR') {
        formattedIncome = formatIndianNumber(currentIncome.toFixed(0));
        formattedWithdrawal = formatIndianNumber(currentWithdrawal.toFixed(0));
        formattedNetworth = formatIndianNumber(currentNetworth.toFixed(0));
      } else {
        formattedIncome = currentIncome.toLocaleString(undefined, {maximumFractionDigits: 0});
        formattedWithdrawal = currentWithdrawal.toLocaleString(undefined, {maximumFractionDigits: 0});
        formattedNetworth = currentNetworth.toLocaleString(undefined, {maximumFractionDigits: 0});
      }

      row.innerHTML = `
        <td class="border px-4 py-2">${year}</td>
        <td class="border px-4 py-2 income-row ${showIncomeColumn ? '' : 'hidden'}">${selectedCurrency.symbol}${formattedIncome}</td>
        <td class="border px-4 py-2">${selectedCurrency.symbol}${formattedWithdrawal}</td>
        <td class="border px-4 py-2">${selectedCurrency.symbol}${formattedNetworth}</td>
      `;
      rows.push(row);

      // Increase withdrawal and income for next year due to inflation
      currentWithdrawal = currentWithdrawal * (1 + inflation);
      currentIncome = currentIncome * (1 + inflation);
      
      // Add data point for chart
      labels.push(`Year ${year}`);
      data.push(currentNetworth);
    }

    // Add the rows to the table body
    rows.forEach((row, index) => {
      if (index === rows.length - 1) {
        if(currentNetworth > initialNetworth) {
          row.classList.add('bg-green-100');
        } else {
          row.classList.add('bg-red-100');
        }
      }
      tableBody.appendChild(row);
    });

    // Create or update chart
    createChart(labels, data);

    // Save to local storage after updating
    saveToLocalStorage();
  }

  // Function to create the chart
  function createChart(labels, data) {
    const ctx = document.getElementById('chart-container').getContext('2d');

    if (chart) {
      chart.destroy(); // Destroy existing chart if it exists
    }

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Networth',
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value, index, values) {
                if (selectedCurrency.code === 'INR') {
                  return selectedCurrency.symbol + formatIndianNumber(value.toFixed(0));
                } else {
                  return selectedCurrency.symbol + value.toLocaleString(undefined, {maximumFractionDigits: 0});
                }
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                if (selectedCurrency.code === 'INR') {
                  return 'Networth: ' + selectedCurrency.symbol + formatIndianNumber(context.parsed.y.toFixed(0));
                } else {
                  return 'Networth: ' + selectedCurrency.symbol + context.parsed.y.toLocaleString(undefined, {maximumFractionDigits: 0});
                }
              }
            }
          },
          legend: {
            display: false // Hide the legend to save space
          }
        }
      }
    });

    // Force a resize after creation to ensure proper fitting
    setTimeout(() => {
      chart.resize();
    }, 0);

    // Save to local storage after creating/updating chart
    saveToLocalStorage();
  }

  // Function to handle window resize
  function handleResize() {
    if (chart) {
      chart.resize();
    }
  }

  // Add event listener for window resize
  window.addEventListener('resize', handleResize);

  // Modify the toggleIncomeColumn function
  function toggleIncomeColumn(show) {
    const incomeHeader = document.querySelector('.income-column');
    const incomeRows = document.querySelectorAll('.income-row');
    
    if (show) {
      incomeHeader.classList.remove('hidden');
      incomeRows.forEach(row => row.classList.remove('hidden'));
    } else {
      incomeHeader.classList.add('hidden');
      incomeRows.forEach(row => row.classList.add('hidden'));
    }
  }
});

// Function to parse formatted number input
const parseFormattedNumber = (value) => {
  return parseFloat(value.replace(/,/g, ''));
};

// Add this function to format numbers in Indian style
function formatIndianNumber(num) {
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
  return parts.join('.');
}