window.addEventListener("load", (event) => {

    const urlInput = document.getElementById('urlInput');
    const durationInput = document.getElementById("durationInput");
    const methodInput = document.getElementById("methodInput");
    const bodyInput = document.getElementById("bodyInput");
    const headersInput = document.getElementById("headersInput");
    const feedbackOutput = document.getElementById("feedbackOutput");
    const output = document.getElementById("output");
    const button = document.getElementById('button');

    
    button.addEventListener('click', function (){

        output.textContent = "";
        const url = urlInput.value;
        let duration = Number(durationInput.value);
        const method = methodInput.value;
        const body = bodyInput.value;

        const controller = new AbortController();
    
        //https://jsonplaceholder.typicode.com/todos
        //{ "Content-Type": "application/json" }    
        //{"title": "asdasdasd", "completed": "false"}

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
                        }
                        else{
                            return response.json().then(json => {
                                output.textContent = JSON.stringify(json, null, 4);
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