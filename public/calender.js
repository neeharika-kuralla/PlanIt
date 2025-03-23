        

        const currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        function generateCalendar(month, year) {
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = 32 - new Date(year, month, 32).getDate();

            const calendarBody = document.getElementById('calendar-body');
            calendarBody.innerHTML = '';

            document.getElementById('month-year').innerText = `${monthNames[month]} ${year}`;

            let date = 1;
            for (let i = 0; i < 6; i++) {
                const row = document.createElement('tr');

                for (let j = 0; j < 7; j++) {
                    const cell = document.createElement('td');

                    if (i === 0 && j < firstDay) {
                        const emptyCell = document.createTextNode('');
                        cell.appendChild(emptyCell);
                    } else if (date > daysInMonth) {
                        break;
                    } else {
                        const cellText = document.createTextNode(date);
                        cell.appendChild(cellText);

                        // Create input field (hidden by default)
                        const inputBox = document.createElement('input');
                        inputBox.type = 'text';
                        inputBox.className = 'hidden-input';
                        inputBox.placeholder = `Enter task `;

                        inputBox.addEventListener('click', function(event) {
                            event.stopPropagation();
                        });

                        // Add click event to show/hide input box
                        cell.addEventListener('click', function() {
                            inputBox.style.display = inputBox.style.display === 'block' ? 'none' : 'block';
                            inputBox.focus();   
                        });

                        cell.appendChild(inputBox);
                        date++;
                    }
                    row.appendChild(cell);
                }
                calendarBody.appendChild(row);
            }
        }

        function prevMonth() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar(currentMonth, currentYear);
        }

        function nextMonth() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar(currentMonth, currentYear);
        }

        generateCalendar(currentMonth, currentYear);