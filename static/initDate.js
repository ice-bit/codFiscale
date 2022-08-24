(() => {
    const daySelect = document.getElementById("daySelect");
    const monthSelect = document.getElementById("monthSelect");
    const yearSelect = document.getElementById("yearSelect");

    // Add days of the month to select form
    Array(32).fill(0).map((_, i) => i).slice(2).forEach(day => {
        const newOption = document.createElement("option");
        newOption.text = day.toString();
        daySelect.add(newOption);
    });

    // Add months of the year to select form
    Array(13).fill(0).map((_, i) => i).slice(2).forEach(day => {
        const newOption = document.createElement("option");
        newOption.text = day.toString();
        monthSelect.add(newOption);
    });
    
    // Add years to select form
    const startYear = 1901;
    const endYear = new Date().getFullYear();
    [...Array(endYear - startYear + 1).keys()].map(i => i + startYear).forEach(year => {
        const newOption = document.createElement("option");
        newOption.text = year.toString();
        yearSelect.add(newOption);
    });
})();