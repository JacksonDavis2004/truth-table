// Custom implication function
function implication(A, B) {
    return !A || B;
}

document.getElementById('truthTableForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let expression = document.getElementById('expression').value;
    const showSubEquations = document.getElementById('showSubEquations').checked;

    let evalExpression = expression.replace(/\bAND\b/g, '&&')
                                   .replace(/\bOR\b/g, '||')
                                   .replace(/\bNOT\b/g, '!')
                                   .replace(/(\([^()]+\)|[A-Za-z]+)\s*IMP\s*([A-Za-z()]+)/g, 'implication($1, $2)')
                                   .replace(/\bIFF\b/g, ' === ');

    const variables = Array.from(new Set(expression.match(/\b[A-Za-z]\b/g))).sort();
    const tableBody = document.querySelector('#truthTable tbody');
    const tableHeader = document.querySelector('#tableHeader');
    tableBody.innerHTML = '';
    tableHeader.innerHTML = '';

    variables.forEach(variable => {
        const th = document.createElement('th');
        th.innerText = variable;
        tableHeader.appendChild(th);
    });

    let subExpressions = [];
    if (showSubEquations) {
        subExpressions = extractSubExpressions(expression);
        subExpressions.forEach(subExpr => {
            const th = document.createElement('th');
            let symbolicSubExpr = subExpr.replace(/\bAND\b/g, '∧')
                                         .replace(/\bOR\b/g, '∨')
                                         .replace(/\bNOT\b/g, '¬')
                                         .replace(/\bIMP\b/g, '→')
                                         .replace(/\bIFF\b/g, '↔');
            th.innerText = symbolicSubExpr;
            tableHeader.appendChild(th);
        });
    }

    const resultHeader = document.createElement('th');
    resultHeader.innerText = expression.replace(/\bAND\b/g, '∧')
                                       .replace(/\bOR\b/g, '∨')
                                       .replace(/\bNOT\b/g, '¬')
                                       .replace(/\bIMP\b/g, '→')
                                       .replace(/\bIFF\b/g, '↔');
    tableHeader.appendChild(resultHeader);

    const rows = Math.pow(2, variables.length);
    for (let i = 0; i < rows; i++) {
        const values = [];
        const bin = i.toString(2).padStart(variables.length, '0');
        let row = `<tr>`;
        for (let j = 0; j < variables.length; j++) {
            values.push(bin[j] === '1');
            row += `<td>${bin[j]}</td>`;
        }

        let subExprResults = {};
        if (showSubEquations) {
            subExpressions.forEach((subExpr, index) => {
                let currentSubExpr = subExpr;
                variables.forEach((variable, index) => {
                    currentSubExpr = currentSubExpr.replace(new RegExp('\\b' + variable + '\\b', 'g'), values[index] ? 'true' : 'false');
                });

                currentSubExpr = currentSubExpr.replace(/\bAND\b/g, '&&')
                                               .replace(/\bOR\b/g, '||')
                                               .replace(/\bNOT\b/g, '!')
                                               .replace(/(\([^()]+\)|[A-Za-z]+)\s*IMP\s*([A-Za-z()]+)/g, 'implication($1, $2)')
                                               .replace(/\bIFF\b/g, ' === ');

                try {
                    const subResult = eval(currentSubExpr);
                    subExprResults[`EXPR${index}`] = subResult;
                    row += `<td>${subResult ? 1 : 0}</td>`;
                } catch (error) {
                    subExprResults[`EXPR${index}`] = false;
                    row += `<td>0</td>`;
                }
            });
        }

        let currentEvalExpression = evalExpression;
        variables.forEach((variable, index) => {
            currentEvalExpression = currentEvalExpression.replace(new RegExp('\\b' + variable + '\\b', 'g'), values[index] ? 'true' : 'false');
        });

        for (const [key, value] of Object.entries(subExprResults)) {
            currentEvalExpression = currentEvalExpression.replace(new RegExp('\\b' + key + '\\b', 'g'), value ? 'true' : 'false');
        }

        try {
            const result = eval(currentEvalExpression);

            const finalCellStyle = result 
                ? 'background-color: rgba(144, 238, 144, 0.5);'
                : 'background-color: rgba(240, 128, 128, 0.5);';
            row += `<td style="${finalCellStyle}">${result ? 1 : 0}</td>`;
        } catch (error) {
            row += `<td style="background-color: rgba(240, 128, 128, 0.3);">0</td>`;
        }
        row += `</tr>`;
        tableBody.innerHTML += row;
    }
    removeExprColumns();
});

function removeExprColumns() {
    const tableHeader = document.querySelectorAll('#tableHeader th');
    const tableRows = document.querySelectorAll('#truthTable tbody tr');
    const columnsToRemove = [];
    tableHeader.forEach((th, index) => {
        if (th.innerText.includes("EXPR")) {
            columnsToRemove.push(index);
        }
    });
    columnsToRemove.reverse().forEach((index) => {
        tableHeader[index].remove();
    });
    tableRows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        columnsToRemove.forEach((index) => {
            cells[index].remove();
        });
    });
}

function extractSubExpressions(expression) {
    const subExpressions = [];
    let expressionCopy = expression.replace(/\bNOT\s+([A-Za-z])\b/g, function(match, p1) {
        subExpressions.push(`NOT ${p1}`);
        return `!${p1}`;
    });

    while (expressionCopy.includes('(')) {
        let startIdx = expressionCopy.lastIndexOf('(');
        let endIdx = expressionCopy.indexOf(')', startIdx);
        if (startIdx !== -1 && endIdx !== -1) {
            let subExpr = expressionCopy.slice(startIdx + 1, endIdx);
            subExpr = subExpr.replace(/\bAND\b/g, '&&')
                             .replace(/\bOR\b/g, '||')
                             .replace(/\bNOT\b/g, '!')
                             .replace(/(\([^()]+\)|[A-Za-z]+)\s*IMP\s*([A-Za-z()]+)/g, 'implication($1, $2)')
                             .replace(/\bIFF\b/g, ' === ');
            subExpressions.push(subExpr);
            expressionCopy = expressionCopy.slice(0, startIdx) + `EXPR${subExpressions.length - 1}` + expressionCopy.slice(endIdx + 1);
        } else {
            break;
        }
    }
    return subExpressions;
}
