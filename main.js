const svg = document.getElementById('svg');
const resultsDiv = document.getElementById('results');

let data = [];

function addData(event) {
    event.preventDefault();
    const xInput = parseFloat(document.getElementById('x-input').value);
    const yInput = parseFloat(document.getElementById('y-input').value);
    if (!isNaN(xInput) && !isNaN(yInput)) {
        const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
        let sumRow = document.getElementById('sum-row');
        if (sumRow) {
            tableBody.removeChild(sumRow);
        }

        const newRow = tableBody.insertRow(-1);
        const numCell = newRow.insertCell(0);
        numCell.textContent = tableBody.rows.length;

        const cell1 = newRow.insertCell(1);
        const cell2 = newRow.insertCell(2);
        const cell3 = newRow.insertCell(3);
        const cell4 = newRow.insertCell(4);
        const cell5 = newRow.insertCell(5);

        cell1.textContent = xInput.toFixed(2);
        cell2.textContent = (xInput * xInput).toFixed(2); // x^2
        cell3.textContent = yInput.toFixed(2); // y
        cell4.textContent = (yInput * yInput).toFixed(2); // y^2
        cell5.textContent = (xInput * yInput).toFixed(2); // x*y

        data.push({ x: xInput, x2: xInput * xInput, y: yInput, y2: yInput * yInput, xy: xInput * yInput });
        draw();
        document.getElementById('x-input').value = '';
        document.getElementById('y-input').value = '';
        calculateStatistics();

        const sums = data.reduce((acc, point) => {
            acc.x += point.x;
            acc.x2 += point.x2;
            acc.y += point.y;
            acc.y2 += point.y2;
            acc.xy += point.xy;
            return acc;
        }, { x: 0, x2: 0, y: 0, y2: 0, xy: 0 });

        sumRow = tableBody.insertRow(-1);
        sumRow.id = 'sum-row';
        const sigmaCell = sumRow.insertCell(0);
        sigmaCell.textContent = 'Σ';
        sumRow.insertCell(1).textContent = sums.x.toFixed(2);
        sumRow.insertCell(2).textContent = sums.x2.toFixed(2);
        sumRow.insertCell(3).textContent = sums.y.toFixed(2);
        sumRow.insertCell(4).textContent = sums.y2.toFixed(2);
        sumRow.insertCell(5).textContent = sums.xy.toFixed(2);
    }
}

function sigma(){
    const sums = data.reduce((acc, point) => {
        acc.x += point.x;
        acc.x2 += point.x2;
        acc.y += point.y;
        acc.y2 += point.y2;
        acc.xy += point.xy;
        return acc;
    }, { x: 0, x2: 0, y: 0, y2: 0, xy: 0 });

    let sumRow = document.getElementById('sum-row');
    if (!sumRow) {
        sumRow = tableBody.insertRow();
        sumRow.id = 'sum-row';
        sumRow.insertCell(0);
        sumRow.insertCell(1);
        sumRow.insertCell(2);
        sumRow.insertCell(3);
        sumRow.insertCell(4);
    }
    sumRow.cells[0].textContent = sums.x.toFixed(2);
    sumRow.cells[1].textContent = sums.x2.toFixed(2);
    sumRow.cells[2].textContent = sums.y.toFixed(2);
    sumRow.cells[3].textContent = sums.y2.toFixed(2);
    sumRow.cells[4].textContent = sums.xy.toFixed(2);
}


function resetData() {
    // Mengosongkan isi tabel data
    document.querySelector("#data-table tbody").innerHTML = '';

    data = [];
    // Mengosongkan input fields
    document.getElementById("x-input").value = '';
    document.getElementById("y-input").value = '';

    // Jika ada grafik atau hasil yang ditampilkan, kosongkan juga
    document.getElementById("svg").innerHTML = '';
    document.getElementById("results").innerHTML = '';
}

function draw() {
    svg.innerHTML = ''; // Bersihkan SVG
    drawAxes();
    drawPoints();
    if (data.length > 1) {
        drawLine();
    }
}

function drawAxes() {
    const padding = 10;
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", svg.height.baseVal.value - padding);
    xAxis.setAttribute("x2", svg.width.baseVal.value - padding);
    xAxis.setAttribute("y2", svg.height.baseVal.value - padding);
    xAxis.setAttribute("stroke", "black");

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", svg.height.baseVal.value - padding);
    yAxis.setAttribute("stroke", "black");

    svg.appendChild(xAxis);
    svg.appendChild(yAxis);
}

function drawPoints() {
    data.forEach(point => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", scaleX(point.x));
        circle.setAttribute("cy", scaleY(point.y));
        circle.setAttribute("r", 5);
        circle.setAttribute("fill", "red");
        svg.appendChild(circle);

        // Menambahkan keterangan koordinat
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", scaleX(point.x) + 10); // Menyesuaikan posisi x dari teks
        text.setAttribute("y", scaleY(point.y));
        text.setAttribute("font-size", "12px");
        text.setAttribute("fill", "black");
        text.textContent = `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
        svg.appendChild(text);
    });
}

function drawLine() {
    const { slope, intercept } = linearRegression();
    const x1 = 0, y1 = intercept;
    const x2 = Math.max(...data.map(p => p.x)), y2 = slope * x2 + intercept;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", scaleX(x1));
    line.setAttribute("y1", scaleY(y1));
    line.setAttribute("x2", scaleX(x2));
    line.setAttribute("y2", scaleY(y2));
    line.setAttribute("stroke", "blue");
    svg.appendChild(line);
}

function linearRegression() {
    const n = data.length;
    const sumX = data.reduce((acc, p) => acc + p.x, 0);
    const sumY = data.reduce((acc, p) => acc + p.y, 0);
    const sumXY = data.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumXX = data.reduce((acc, p) => acc + p.x * p.x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

function calculateStatistics() {
    const { slope, intercept } = linearRegression();
    const residuals = data.map(p => p.y - (slope * p.x + intercept));
    const ssRes = residuals.reduce((acc, r) => acc + r * r, 0);
    const ssTot = data.reduce((acc, p) => acc + Math.pow(p.y - (data.reduce((sum, p) => sum + p.y, 0) / data.length), 2), 0);
    const rSquared = 1 - ssRes / ssTot;

    resultsDiv.innerHTML = `
        <p>Y = ${intercept.toFixed(2)} + ${slope.toFixed(2)}x</p>
        <p>a = Konstanta (Intercept): ${intercept.toFixed(2)}</p>
        <p>b = Koefisien Regresi (Slope): ${slope.toFixed(2)}</p>
        <p>R<sup>2</sup> = Nilai R-squared: ${rSquared.toFixed(2)}</p>
    `;
}

function scaleX(x) {
    const maxX = Math.max(...data.map(p => p.x));
    const padding = 10;
    return padding + (x / maxX) * (svg.width.baseVal.value - 2 * padding);
}

function scaleY(y) {
    const maxY = Math.max(...data.map(p => p.y));
    const padding = 10;
    return svg.height.baseVal.value - padding - (y / maxY) * (svg.height.baseVal.value - 2 * padding);
}
