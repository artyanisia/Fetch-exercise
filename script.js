window.addEventListener("load", (event) => {
    
    const feedbackOutput = document.getElementById("feedbackOutput");
    const output = document.getElementById("output");
    const durationInput = document.getElementById("input");
    const button = document.getElementById('button');

    button.addEventListener('click', function (){
        const controller = new AbortController();
        const url = "https://jsonplaceholder.typicode.com/posts/1";
    
        let duration = Number(durationInput.value);
    
        if (isNaN(duration) || duration <= 0) {
    
            duration = 5000; // Default to 5 seconds if input is invalid
            feedbackOutput.textContent = 'Invalid input. Defaulting to 5 seconds.';
            feedbackOutput.textContent = '';
            fetchApi(controller, url, duration);

    
        } else {
            fetchApi(controller,url,duration);
        }

        function fetchApi (controller, url, duration) {

            const timeoutId = setTimeout(() => controller.abort(), duration);
        
            const response = fetch(url, {
                method: 'PUT',
                body: JSON.stringify({
                    id: 1,
                    title: 'foo',
                    body: 'bar',
                    userId: 1,
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
                .then(response => response.json())
                .then(json => {
                    //Display the JSON data as a formatted string
                    output.textContent = JSON.stringify(json, null, 4);
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