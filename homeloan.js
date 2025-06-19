// homeloan.js

function calculateLoanWithOffset() {
    const loanAmount = parseFloat(document.getElementById("loanAmount").value);
    const initialOffset = parseFloat(document.getElementById("initialOffset").value);
    const monthlyOffset = parseFloat(document.getElementById("monthlyOffset").value);
    const annualRate = parseFloat(document.getElementById("annualRate").value) / 100;
    const loanTermYears = parseInt(document.getElementById("loanTermYears").value);
  
    if ([loanAmount, initialOffset, monthlyOffset, annualRate, loanTermYears].some(isNaN)) {
      alert("请填写所有字段，并确保输入为数字。");
      return;
    }
  
    const monthlyRate = annualRate / 12;
    const loanTermMonths = loanTermYears * 12;
    const monthlyPayment = calculateMonthlyRepayment(loanAmount, monthlyRate, loanTermMonths);
  
    let loanBalance = loanAmount;
    let offsetBalance = initialOffset;
    let totalInterest = 0;
    let month = 0;
    const chartLabels = [];
    const chartDataInterest = [];
    const chartDataLoanBalance = [];
    const chartDataOffsetBalance = [];
    const chartDataEffectiveBalance = [];
  
    const startDate = new Date();
  
    while (loanBalance > 0 && month < 1000) {
      const effectiveBalance = Math.max(loanBalance - offsetBalance, 0);
      const interest = effectiveBalance * monthlyRate;
      const principal = monthlyPayment - interest;
  
      loanBalance -= principal;
      if (loanBalance < 0) loanBalance = 0;
  
      totalInterest += interest;
      offsetBalance = offsetBalance + monthlyOffset - monthlyPayment;
  
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + month);
      const label = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
      chartLabels.push(label);
      chartDataInterest.push(parseFloat(interest.toFixed(2)));
      chartDataLoanBalance.push(parseFloat(loanBalance.toFixed(2)));
      chartDataOffsetBalance.push(parseFloat(offsetBalance.toFixed(2)));
      chartDataEffectiveBalance.push(parseFloat(effectiveBalance.toFixed(2)));
  
      if (offsetBalance >= loanBalance) break;
      month++;
    }
  
    const payoffDate = new Date(startDate.getFullYear(), startDate.getMonth() + month + 1);
    const payoffYear = payoffDate.getFullYear();
    const payoffMonth = payoffDate.getMonth() + 1;
  
    const totalInterestWithoutOffset = loanTermMonths * monthlyPayment - loanAmount;
    const interestSaved = totalInterestWithoutOffset - totalInterest;
    const interestSavedPercent = (interestSaved / totalInterestWithoutOffset) * 100;
  
    document.getElementById("results").innerHTML = `
      <p>每月还款金额：$${formatNumber(monthlyPayment)}</p>
      <p>Offset 达到贷款余额的时间：约 ${Math.floor((month + 1) / 12)} 年 ${(month + 1) % 12} 个月（约为 ${payoffYear} 年 ${payoffMonth} 月）</p>
      <p>总利息支出：$${formatNumber(totalInterest)}</p>
      <p><strong>无 Offset 时的总利息：</strong>$${formatNumber(totalInterestWithoutOffset)}</p>
      <p><strong>节省利息：</strong>$${formatNumber(interestSaved)}</p>
      <p><strong>节省百分比：</strong>${interestSavedPercent.toFixed(2)}%</p>
    `;
  
    renderChart(chartLabels, chartDataInterest);
    renderEffectiveBalanceChart(chartLabels, chartDataLoanBalance, chartDataOffsetBalance, chartDataEffectiveBalance);
  }
  
  function calculateMonthlyRepayment(principal, rate, months) {
    return principal * (rate * Math.pow(1 + rate, months)) /
           (Math.pow(1 + rate, months) - 1);
  }
  
  function formatNumber(num) {
    return Number(num).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  function updateMonthlyRepayment() {
    const loanAmount = parseFloat(document.getElementById("loanAmount").value);
    const annualRate = parseFloat(document.getElementById("annualRate").value) / 100;
    const loanTermYears = parseInt(document.getElementById("loanTermYears").value);
    if ([loanAmount, annualRate, loanTermYears].some(isNaN)) return;
  
    const monthlyRate = annualRate / 12;
    const loanTermMonths = loanTermYears * 12;
    const monthlyPayment = calculateMonthlyRepayment(loanAmount, monthlyRate, loanTermMonths);
    document.getElementById("monthlyRepayment").value = formatNumber(monthlyPayment);
  }
  
  window.addEventListener("DOMContentLoaded", updateMonthlyRepayment);
  ["loanAmount", "annualRate", "loanTermYears"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateMonthlyRepayment);
  });
  
  function renderChart(labels, interestData) {
    const ctx = document.getElementById("loanChart").getContext("2d");
    if (window.loanChartInstance) {
      window.loanChartInstance.destroy();
    }
    window.loanChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "每月利息 ($)",
            data: interestData,
            borderWidth: 2,
            fill: false,
            tension: 0.2,
            borderColor: "rgba(255, 99, 132, 0.8)",
            backgroundColor: "rgba(255, 99, 132, 0.4)"
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '每月利息 ($)'
            }
          }
        }
      }
    });
  }
  
  function renderEffectiveBalanceChart(labels, loanBalanceData, offsetBalanceData, effectiveBalanceData) {
    const ctx = document.getElementById("effectiveBalanceChart").getContext("2d");
    if (window.effectiveChartInstance) {
      window.effectiveChartInstance.destroy();
    }
    window.effectiveChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "贷款余额 ($)",
            data: loanBalanceData,
            backgroundColor: "rgba(255, 183, 197, 0.4)",
            borderColor: "rgba(255, 99, 132, 0.6)",
            fill: true,
            tension: 0.3
          },
          {
            label: "Offset 余额 ($)",
            data: offsetBalanceData,
            backgroundColor: "rgba(173, 216, 230, 0.4)",
            borderColor: "rgba(100, 181, 246, 0.6)",
            fill: true,
            tension: 0.3
          },
          {
            label: "实际计息金额 ($)",
            data: effectiveBalanceData,
            backgroundColor: "rgba(204, 153, 255, 0.4)",
            borderColor: "rgba(153, 102, 255, 0.6)",
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '贷款 vs Offset vs 实际计息金额（柔和面积图）'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }