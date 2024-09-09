document.addEventListener('DOMContentLoaded', () => {

    //const urlInput = document.getElementById('urlInput');
    const durationInput = document.getElementById("durationInput");
    durationInput.style.display ='none';
    const durationInputLabel = document.getElementById("durationInputLabel");
    durationInputLabel.style.display ='none';
    const methodInput = document.getElementById("methodInput");
    methodInput.style.display ='none';
    const methodInputLabel = document.getElementById("methodInputLabel");
    methodInputLabel.style.display ='none';
    const bodyInput = document.getElementById("bodyInput");
    bodyInput.style.display ='none';
    const bodyInputLabel = document.getElementById("bodyInputLabel");
    bodyInputLabel.style.display ='none';
    const headersInput = document.getElementById("headersInput");
    headersInput.style.display ='none';
    const headersInputLabel = document.getElementById("headersInputLabel");
    headersInputLabel.style.display ='none';
    const feedbackOutput = document.getElementById("feedbackOutput");
    const output = document.getElementById("output");
    const getButton = document.getElementById('getButton');
    const postButton = document.getElementById('postButton');
    const putButton = document.getElementById('putButton');
    const patchButton = document.getElementById('patchButton');
    const deleteButton = document.getElementById('deleteButton');
    const button = document.getElementById('button');

    const wrapper = document.getElementById('wrapper');
    
    wrapper.addEventListener('click', (event) => {
    })

    wrapper.addEventListener('click', (event) => {
        
        if (event.target.nodeName === 'BUTTON') {
            const buttonClicked = event.target;

            if(buttonClicked == postButton ||buttonClicked == putButton){
                headersInput.style.display ='block';
                headersInputLabel.style.display ='block';
                bodyInput.style.display ='block';
                bodyInputLabel.style.display ='block';
            }
            else if(buttonClicked == headButton){
                headersInput.style.display ='block';
                headersInputLabel.style.display ='block';
            }
        } 
        output.textContent = "";
        const url = 'https://jsonplaceholder.typicode.com/todos';
        let duration = Number(durationInput.value);
        const method = methodInput.value;
        const body = bodyInput.value;
        let headers;

        try {
            headers = JSON.parse(headersInput.value); // Parse headers if they're input as JSON
        } catch {
            headers = {};
            feedbackOutput.textContent = 'Invalid headers format. Defaulting to empty headers.';
        }

        const controller = new AbortController();
    
        //https://jsonplaceholder.typicode.com/todos/1
        //{ "Content-Type": "application/json" }    
        //{"userId": 1, "id": 21, "title": "newtitle", "completed": true}

        function createTable(data, headers) {
            let table = document.createElement('table');
            let thead = document.createElement('thead');
            let tbody = document.createElement('tbody');
            //add a child node to a parent node
            table.appendChild(thead);
            table.appendChild(tbody);
        
            // Create table headers dynamically
            
            let headerRow = document.createElement('tr');
            headers.forEach(header => {
                let th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th); //Appends this header cell to the headerRow created earlier.
            });
            thead.appendChild(headerRow);
        
            // Group data by userId

            let groupedData = data.reduce((acc, item) => {
                if (!acc[item.userId]) {
                    acc[item.userId] = []; //initializes an empty array
                }
                acc[item.userId].push(item); //pushes current item corresponding to its userId

                return acc;
            }, {});
        
            // Create table rows for each userId
            for (let userId in groupedData) {

                let userItems = groupedData[userId];
                let rowCount = userItems.length;
        
                // Create a row for the userId
                let row = document.createElement('tr');
                let userIdCell = document.createElement('td');
                userIdCell.rowSpan = rowCount; // Span across all rows for this userId
                userIdCell.textContent = userId;
                row.appendChild(userIdCell);
        
                let firstItem = userItems[0];
                headers.slice(1).forEach(header => {
                    let cell = document.createElement('td');
                    cell.textContent = firstItem[header.toLowerCase()];
                    row.appendChild(cell);
                });
        
                 tbody.appendChild(row);
        
                for (let i = 1; i < rowCount; i++) {
                    let item = userItems[i];
                    let row = document.createElement('tr');
        
                    headers.slice(1).forEach(header => {
                        let cell = document.createElement('td');
                        cell.textContent = item[header.toLowerCase()];
                        row.appendChild(cell);
                    });
        
                    tbody.appendChild(row);
                }
            }
        
            document.getElementById('output').appendChild(table);
        }
        
        const requestOptions = {
            method: method,
            headers: headers,
            signal: controller.signal
        };
    
        if (method === 'post' || method === 'put' || method === 'patch') {
            requestOptions.body = body; // Include body only for methods that allow it
        }
    
        const request = new Request(url, requestOptions);
    
        if (isNaN(duration) || duration <= 0) {
    
            duration = 5000; // Default to 5 seconds if input is invalid
            feedbackOutput.textContent = 'Invalid input. Defaulting to 5 seconds.';
            feedbackOutput.textContent = '';
        }

        fetchApi(request,duration);

        function fetchApi (request, duration) {

            const timeoutId = setTimeout(() => controller.abort(), duration)
            fetch(request)
                .then(response => {

                    console.log('Response Status:', response.status); 

                    if (response.status === 204) {
                        output.textContent = 'Request successful with no content.';

                    } else if (response.status === 200 || response.status === 201) {
                        if(method === 'head'){
                            
                            const headers = {};
                            response.headers.forEach((value, key) => {
                                headers[key] = value;
                            });

                            console.log(headers);

                            output.textContent = 'Status Code: ' + response.status + '\n' +
                                'Response Headers:\n' +
                                Object.entries(headers)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join('\n');
                        }else{

                            return response.json().then(json => {

                                document.getElementById('output').textContent = '';
                                
                                let data = Array.isArray(json) ? json : [json];
                                
                                if (data.length > 0) {
                                    
                                    let headers = Object.keys(data[0]);

                                    createTable(data,headers);

                                } else {
                                    document.getElementById('output').textContent = 'No data available.';
                                }
                            });
                        }
                                
                    } else {
                        output.textContent = `Unexpected status code: ${response.status}`;
                    }
                })
                .catch((err) => {
                    if (err.name === 'AbortError') {
                        output.textContent = 'The request timed out. Please try again later.';
                    } else {
                        output.textContent = `Error: ${err.message}`;
                    }
                    console.error('Fetch error:', err);
                })
                .finally(() => {
                    clearTimeout(timeoutId);
                });
        }
    })
    
})