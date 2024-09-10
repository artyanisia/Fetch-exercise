document.addEventListener('DOMContentLoaded', () => {

    //const urlInput = document.getElementById('urlInput');
    const getTable = document.getElementById("getTable");
    const createDB = document.getElementById("createDB");
    const deleteTask = document.getElementById("deleteTask");
    const showTable = document.getElementById("showTable");
    const deleteInput = document.getElementById("deleteInput");
    const addTitle = document.getElementById("addTitle");
    const addUser = document.getElementById("addUser");
    const addTask = document.getElementById("addTask");
    const completeInput = document.getElementById("completeInput");
    const completeTask = document.getElementById("completeTask");
    let tableFetched = null;
    let data;

    const wrapper = document.getElementById('wrapper');

    function createTable(data) {
        
        output.textContent ='';

        let headers = Object.keys(data[0]);
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

    getTable.addEventListener('click', (event) => {
        
        output.textContent = "";
        const controller = new AbortController();
        
        const requestOptions = {
            method: "get",
            signal: controller.signal
        };
    
        const request = new Request("https://jsonplaceholder.typicode.com/todos", requestOptions);
    
        fetchApi(request);

        function fetchApi (request) {

            const timeoutId = setTimeout(() => controller.abort(), 5000)
            fetch(request)
                .then(response => {

                    console.log('Response Status:', response.status); 

                    if (response.status === 204) {
                        output.textContent = 'Request successful with no content.';

                    } else if (response.status === 200 || response.status === 201) {
                        return response.json().then(json => {

                            document.getElementById('output').textContent = '';
                            
                            data = Array.isArray(json) ? json : [json];
                            
                            if (data.length > 0) {
                                
                                tableFetched = 1;

                            } else {
                                document.getElementById('output').textContent = 'No data available.';
                            }
                        });

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

    createDB.addEventListener('click', (event) => {

        if(tableFetched){

            let request = indexedDB.open("MyDatabase", 1); //opens or creates

            request.onupgradeneeded = function(event) {  //if the db needs to be updated or created
                let db = event.target.result;
                if (!db.objectStoreNames.contains("TODO")) {
                    let objectStore = db.createObjectStore("TODO", { keyPath: "id", autoIncrement: true });
                    objectStore.createIndex("userId", "userId", { unique: false });
                    objectStore.createIndex("title", "title", { unique: false });
                    objectStore.createIndex("completed", "completed", { unique: false });
                }
            };
        
            request.onsuccess = function(event) {  //when it opens
                let db = event.target.result;
        
                let transaction = db.transaction(["TODO"], "readwrite");  //readwrite allow modifications
                let objectStore = transaction.objectStore("TODO");

                data.forEach(item => {
                    
                    let addRequest = objectStore.add(item);
                    addRequest.onsuccess = function() {
                        //console.log("Data added to IndexedDB:", item);
                    };
                    addRequest.onerror = function(event) {
                        console.error("Error adding data to IndexedDB:", event.target.errorCode);
                    };
                });
                transaction.oncomplete = function() {
                    console.log("Transaction complete.");
                };
        
                transaction.onerror = function(event) {
                    console.error("Transaction error:", event.target.errorCode);
                };
            }
            request.onerror = function(event) {
                console.error("Error opening IndexedDB:", event.target.errorCode);
            };
        }
    })

    function fetchDataFromIndexedDB(callback) {
        let request = indexedDB.open("MyDatabase", 1);
    
        request.onsuccess = function(event) {
            let db = event.target.result;
    
            let transaction = db.transaction(["TODO"], "readonly");
            let objectStore = transaction.objectStore("TODO");
    
            let getAllRequest = objectStore.getAll(); // Fetch all records

            getAllRequest.onsuccess = function(event) {
                callback(event.target.result); // Pass data to the callback
            };
    
            getAllRequest.onerror = function(event) {
                console.error("Error fetching data from IndexedDB:", event.target.errorCode);
            };
    
            transaction.oncomplete = function() {
                console.log("Transaction complete.");
            };
    
            transaction.onerror = function(event) {
                console.error("Transaction error:", event.target.errorCode);
            };
        };
    
        request.onerror = function(event) {
            console.error("Error opening IndexedDB:", event.target.errorCode);
        };
    }
    
    function addNewTask(title,userId) {
        let request = indexedDB.open("MyDatabase", 1); // Open or create the database
    
        request.onsuccess = function(event) {
            let db = event.target.result;
            
            let transaction = db.transaction(["TODO"], "readwrite"); 
            let objectStore = transaction.objectStore("TODO");
    
            // Fetch all items to find the next available id
            let getAllRequest = objectStore.getAll();
    
            getAllRequest.onsuccess = function(event) {
                let tasks = event.target.result;
                let nextId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1; // Find the next available id
    
                let newTask = {
                    id: nextId,
                    userId: userId, 
                    title: title,
                    completed: false
                };
    
                let addRequest = objectStore.add(newTask); 
    
                addRequest.onsuccess = function() {
                    console.log("New task added:", newTask);
                };
    
                addRequest.onerror = function(event) {
                    console.error("Error adding new task to IndexedDB:", event.target.errorCode);
                };
            };
    
            getAllRequest.onerror = function(event) {
                console.error("Error fetching tasks from IndexedDB:", event.target.errorCode);
            };
    
            transaction.oncomplete = function() {
                console.log("Transaction complete.");
            };
    
            transaction.onerror = function(event) {
                console.error("Transaction error:", event.target.errorCode);
            };
        };
    
        request.onerror = function(event) {
            console.error("Error opening IndexedDB:", event.target.errorCode);
        };
    }
    
    function deleteDataFromIndexedDB(id) {

        let request = indexedDB.open("MyDatabase", 1);
    
        request.onsuccess = function(event) {

            let db = event.target.result;
    
            let transaction = db.transaction(["TODO"], "readwrite");
            let objectStore = transaction.objectStore("TODO");
    
            let deleteRequest = objectStore.delete(id);
    
            deleteRequest.onsuccess = function() {
                console.log(`Record with id ${id} deleted successfully.`);
            };
    
            deleteRequest.onerror = function(event) {
                console.error("Error deleting record:", event.target.errorCode);
            };
    
            transaction.oncomplete = function() {
                console.log("Transaction complete.");
            };
    
            transaction.onerror = function(event) {
                console.error("Transaction error:", event.target.errorCode);
            };
        };
    
        request.onerror = function(event) {
            console.error("Error opening IndexedDB:", event.target.errorCode);
        };
    }
    function completeTheTask(taskId) {
        let request = indexedDB.open("MyDatabase", 1);
    
        request.onsuccess = function(event) {
            let db = event.target.result;
    
            let transaction = db.transaction(["TODO"], "readwrite"); 
            let objectStore = transaction.objectStore("TODO");
    
            let getRequest = objectStore.get(taskId);
    
            getRequest.onsuccess = function(event) {
                let task = event.target.result;
    
                if (task) {
                    task.completed = true;
    
                    let updateRequest = objectStore.put(task);
    
                    updateRequest.onsuccess = function() {
                        console.log(`Task with id ${taskId} marked as complete.`);
                    };
    
                    updateRequest.onerror = function(event) {
                        console.error("Error updating task in IndexedDB:", event.target.errorCode);
                    };
                } else {
                    console.error(`Task with id ${taskId} not found.`);
                }
            };
    
            getRequest.onerror = function(event) {
                console.error("Error fetching task from IndexedDB:", event.target.errorCode);
            };
    
            transaction.oncomplete = function() {
                console.log("Transaction complete.");
            };
    
            transaction.onerror = function(event) {
                console.error("Transaction error:", event.target.errorCode);
            };
        };
    
        request.onerror = function(event) {
            console.error("Error opening IndexedDB:", event.target.errorCode);
        };
    }

    // function handleTask(action, taskData = {}) {
    //     let request = indexedDB.open("MyDatabase", 1); 
    
    //     request.onsuccess = function(event) {
    //         let db = event.target.result;
    //         let transaction = db.transaction(["TODO"], "readwrite");
    //         let objectStore = transaction.objectStore("TODO");
    
    //         switch (action) {
    //             case 'add':
    //                 let nextId = taskData.id || Date.now(); 
    //                 let newTask = {
    //                     id: nextId,
    //                     userID: taskData.userID || '1', 
    //                     title: taskData.title,
    //                     completed: false
    //                 };
    
    //                 let addRequest = objectStore.add(newTask);
    //                 addRequest.onsuccess = function() {
    //                     console.log("Task added to IndexedDB:", newTask);
    //                 };
    //                 addRequest.onerror = function(event) {
    //                     console.error("Error adding task to IndexedDB:", event.target.errorCode);
    //                 };
    //                 break;
    
    //             case 'complete':
    //                 let getRequest = objectStore.get(taskData.id);
    
    //                 getRequest.onsuccess = function(event) {
    //                     let task = event.target.result;
    //                     if (task) {
    //                         task.completed = true;
    //                         let updateRequest = objectStore.put(task);
    //                         updateRequest.onsuccess = function() {
    //                             console.log(`Task with id ${taskData.id} marked as complete.`);
    //                         };
    //                         updateRequest.onerror = function(event) {
    //                             console.error("Error updating task in IndexedDB:", event.target.errorCode);
    //                         };
    //                     } else {
    //                         console.error(`Task with id ${taskData.id} not found.`);
    //                     }
    //                 };
    //                 getRequest.onerror = function(event) {
    //                     console.error("Error fetching task from IndexedDB:", event.target.errorCode);
    //                 };
    //                 break;
    
    //             case 'delete':

    //                 let deleteRequest = objectStore.delete(taskData.id);

    //                 deleteRequest.onsuccess = function() {
    //                     console.log(`Task with id ${taskData.id} deleted.`);
    //                 };
    //                 deleteRequest.onerror = function(event) {
    //                     console.error("Error deleting task from IndexedDB:", event.target.errorCode);
    //                 };
    //                 break;
    
    //             default:
    //                 console.error("Invalid action type. Use 'add', 'complete', or 'delete'.");
    //         }
    //         transaction.oncomplete = function() {
    //             console.log("Transaction complete.");
    //         };
    //         transaction.onerror = function(event) {
    //             console.error("Transaction error:", event.target.errorCode);
    //         };
    //     };
    
    //     request.onerror = function(event) {
    //         console.error("Error opening IndexedDB:", event.target.errorCode);
    //     };
    // }

    function refreshTable() {
        fetchDataFromIndexedDB(createTable); 
    }

    deleteTask.addEventListener('click', () => {
        deleteDataFromIndexedDB(deleteInput.value);
        refreshTable();
    })
    addTask.addEventListener('click', () => {
        addNewTask( addTitle.value,  addUser.value );
        refreshTable();
    })
    completeTask.addEventListener('click', () => {
        completeTheTask(completeInput.value);
        refreshTable();
    })
    showTable.addEventListener('click', () => {
        refreshTable();
    });
    
})