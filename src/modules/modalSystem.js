// Modal system for padlock configuration

// Function to create a custom input modal with character counter
function createInputModal(title, description, currentValue = "", maxLength = 140, placeholder = "", inputType = "textarea") {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        // Create content
        const inputElement = inputType === "textarea" ? 
            `<textarea id="modalInput" style="
                width: 100%;
                height: 80px;
                padding: 8px;
                border: 2px solid #ddd;
                border-radius: 4px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                resize: vertical;
                box-sizing: border-box;
            " placeholder="${placeholder}">${currentValue}</textarea>` :
            `<input type="text" id="modalInput" style="
                width: 100%;
                padding: 8px;
                border: 2px solid #ddd;
                border-radius: 4px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                box-sizing: border-box;
            " placeholder="${placeholder}" value="${currentValue}">`;
        
        modal.innerHTML = `
            <h3 style="margin-top: 0; color: #333; font-family: Arial, sans-serif;">${title}</h3>
            <p style="color: #666; margin: 10px 0; font-family: Arial, sans-serif; font-size: 14px;">${description}</p>
            ${inputElement}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; flex-wrap: wrap;">
                <span id="charCounter" style="color: #666; font-size: 12px; font-family: Arial, sans-serif;">0 / ${maxLength} characters</span>
                <div style="margin-top: 5px;">
                    <button id="hintCancel" style="
                        padding: 10px 16px;
                        margin-right: 8px;
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        cursor: pointer;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        min-width: 70px;
                    ">Cancel</button>
                    <button id="hintOk" style="
                        padding: 10px 16px;
                        background: #007bff;
                        color: white;
                        border: 1px solid #007bff;
                        border-radius: 4px;
                        cursor: pointer;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        min-width: 70px;
                    ">OK</button>
                </div>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        const inputField = modal.querySelector('#modalInput');
        const charCounter = modal.querySelector('#charCounter');
        const okButton = modal.querySelector('#hintOk');
        const cancelButton = modal.querySelector('#hintCancel');
        
        // Update character counter
        function updateCounter() {
            const length = inputField.value.length;
            charCounter.textContent = `${length} / ${maxLength} characters`;
            
            if (length > maxLength) {
                charCounter.style.color = '#dc3545';
                inputField.style.borderColor = '#dc3545';
                okButton.disabled = true;
                okButton.style.opacity = '0.5';
                okButton.style.cursor = 'not-allowed';
            } else {
                charCounter.style.color = '#666';
                inputField.style.borderColor = '#ddd';
                okButton.disabled = false;
                okButton.style.opacity = '1';
                okButton.style.cursor = 'pointer';
            }
        }
        
        // Event listeners
        inputField.addEventListener('input', updateCounter);
        
        okButton.addEventListener('click', () => {
            if (inputField.value.length <= maxLength) {
                resolve(inputField.value);
                document.body.removeChild(overlay);
            }
        });
        
        cancelButton.addEventListener('click', () => {
            resolve(null);
            document.body.removeChild(overlay);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                resolve(null);
                document.body.removeChild(overlay);
            }
        });
        
        // Focus input field and update counter
        inputField.focus();
        inputField.setSelectionRange(inputField.value.length, inputField.value.length);
        updateCounter();
    });
}

// Function to create a timer configuration modal
function createTimerModal(padlockType, currentConfig = {}) {
    return new Promise((resolve) => {
        // Determine max time based on padlock type
        const maxHours = padlockType === "LoversTimerPadlock" ? 168 : 4; // 7 days vs 4 hours
        const lockTypeName = padlockType.replace("TimerPadlock", "").replace("Padlock", "");
        
        // Create hour options based on lock type
        const hourOptions = [];
        for (let i = 0; i <= maxHours; i++) {
            hourOptions.push(i);
        }
        
        // Minute options (include 5 for BC default, then 15-minute increments)
        const minuteOptions = [0, 5, 15, 30, 45];
        
        // Parse current config or use defaults
        let currentHours = 0; // Default to 0 hours
        let currentMinutes = 5; // Default to 5 minutes (BC default)
        
        if (currentConfig.RemoveTimer && currentConfig.RemoveTimer > CurrentTime) {
            const remainingMs = currentConfig.RemoveTimer - CurrentTime;
            currentHours = Math.floor(remainingMs / (60 * 60 * 1000));
            currentMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
            
            // Round minutes to nearest available option (5, 15, 30, 45)
            const availableMinutes = [0, 5, 15, 30, 45];
            currentMinutes = availableMinutes.reduce((prev, curr) => 
                Math.abs(curr - currentMinutes) < Math.abs(prev - currentMinutes) ? curr : prev
            );
            if (currentMinutes >= 60) {
                currentHours += Math.floor(currentMinutes / 60);
                currentMinutes = currentMinutes % 60;
            }
            
            // Ensure we don't exceed max hours
            if (currentHours > maxHours) {
                currentHours = maxHours;
                currentMinutes = 0;
            }
        }
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 450px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        // Create hour dropdown options
        const hourOptionsHTML = hourOptions.map(h => 
            `<option value="${h}" ${h === currentHours ? 'selected' : ''}>${h}</option>`
        ).join('');
        
        // Create minute dropdown options
        const minuteOptionsHTML = minuteOptions.map(m => 
            `<option value="${m}" ${m === currentMinutes ? 'selected' : ''}>${m}</option>`
        ).join('');
        
        modal.innerHTML = `
            <h3 style="margin-top: 0; color: #333; font-family: Arial, sans-serif;">${lockTypeName} Timer Configuration</h3>
            <p style="color: #666; margin: 10px 0; font-family: Arial, sans-serif; font-size: 14px;">
                Configure the timer settings for this lock (max ${maxHours === 168 ? '7 days' : '4 hours'})
            </p>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Timer Duration:</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <select id="timerHours" style="
                        padding: 8px;
                        border: 2px solid #ddd;
                        border-radius: 4px;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        background: white;
                    ">
                        ${hourOptionsHTML}
                    </select>
                    <span style="color: #666;">hours</span>
                    <select id="timerMinutes" style="
                        padding: 8px;
                        border: 2px solid #ddd;
                        border-radius: 4px;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        background: white;
                    ">
                        ${minuteOptionsHTML}
                    </select>
                    <span style="color: #666;">minutes</span>
                </div>
                ${maxHours === 4 ? '' : `<div id="totalTime" style="
                    margin-top: 8px;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    font-weight: bold;
                    color: #007bff;
                    font-size: 14px;
                ">Total: 0 hours 5 minutes</div>`}
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="removeItem" ${currentConfig.RemoveItem === true || (currentConfig.RemoveItem === undefined && (padlockType === "MistressTimerPadlock" || padlockType === "LoversTimerPadlock")) ? 'checked' : ''} style="margin-right: 8px;">
                    <span style="color: #333; font-size: 14px;">Remove item when timer expires</span>
                </label>
            </div>
            
            <div style="margin-bottom: 15px; margin-left: 16px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="randomizeRemoval" ${currentConfig.RemoveItem === "random" ? 'checked' : ''} style="margin-right: 8px;">
                    <span style="color: #666; font-size: 13px;">Randomize item removal</span>
                </label>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="enableRandomInput" ${currentConfig.EnableRandomInput !== false ? 'checked' : ''} style="margin-right: 8px;">
                    <span style="color: #333; font-size: 14px;">Enable random input from others</span>
                </label>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="showTimer" ${currentConfig.ShowTimer !== false ? 'checked' : ''} style="margin-right: 8px;">
                    <span style="color: #333; font-size: 14px;">Show timer to wearer</span>
                </label>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="timerCancel" style="
                    padding: 10px 16px;
                    background: #f0f0f0;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    min-width: 70px;
                ">Cancel</button>
                <button id="timerOk" style="
                    padding: 10px 16px;
                    background: #007bff;
                    color: white;
                    border: 1px solid #007bff;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    min-width: 70px;
                ">OK</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        const hoursSelect = modal.querySelector('#timerHours');
        const minutesSelect = modal.querySelector('#timerMinutes');
        const totalTimeDiv = modal.querySelector('#totalTime');
        const removeItemCheckbox = modal.querySelector('#removeItem');
        const randomizeRemovalCheckbox = modal.querySelector('#randomizeRemoval');
        const enableRandomInputCheckbox = modal.querySelector('#enableRandomInput');
        const showTimerCheckbox = modal.querySelector('#showTimer');
        const okButton = modal.querySelector('#timerOk');
        const cancelButton = modal.querySelector('#timerCancel');
        
        // Function to update total time display and enforce limits
        function updateTotalTime() {
            let hours = parseInt(hoursSelect.value);
            let minutes = parseInt(minutesSelect.value);
            
            // Enforce max time limits for non-Lovers locks
            if (maxHours === 4) { // MistressTimerPadlock or TimerPasswordPadlock
                const totalMinutes = hours * 60 + minutes;
                if (totalMinutes > 240) { // 4 hours = 240 minutes
                    // Reset to 4 hours exactly
                    hours = 4;
                    minutes = 0;
                    hoursSelect.value = hours;
                    minutesSelect.value = minutes;
                }
                // No time display for 4-hour locks - just return after enforcement
                return;
            }
            
            // Enforce max time limits for LoversTimer padlock (7 days = 168 hours)
            if (maxHours === 168) { // LoversTimerPadlock
                const totalMinutes = hours * 60 + minutes;
                if (totalMinutes > 10080) { // 7 days = 10080 minutes
                    // Reset to 7 days exactly
                    hours = 168;
                    minutes = 0;
                    hoursSelect.value = hours;
                    minutesSelect.value = minutes;
                }
            }
            
            // Only update display for LoversTimer padlock
            if (!totalTimeDiv) return;
            
            let timeText = "";
            if (hours === 0 && minutes === 0) {
                timeText = "No timer set";
                totalTimeDiv.style.color = "#dc3545";
            } else {
                const parts = [];
                
                // For LoversTimer padlock, show days when >= 24 hours
                if (padlockType === "LoversTimerPadlock" && hours >= 24) {
                    const days = Math.floor(hours / 24);
                    const remainingHours = hours % 24;
                    
                    if (days > 0) {
                        parts.push(`${days} day${days !== 1 ? 's' : ''}`);
                    }
                    if (remainingHours > 0) {
                        parts.push(`${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`);
                    }
                    if (minutes > 0) {
                        parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
                    }
                } else {
                    // Standard hours/minutes display
                    if (hours > 0) {
                        parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
                    }
                    if (minutes > 0) {
                        parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
                    }
                }
                
                timeText = `Total: ${parts.join(' ')}`;
                totalTimeDiv.style.color = "#007bff";
            }
            
            totalTimeDiv.textContent = timeText;
        }
        
        // Event listeners for real-time updates
        hoursSelect.addEventListener('change', updateTotalTime);
        minutesSelect.addEventListener('change', updateTotalTime);
        
        // Initialize total time display
        updateTotalTime();
        
        // Handle checkbox interactions - ensure mutual exclusion
        removeItemCheckbox.addEventListener('click', () => {
            if (removeItemCheckbox.checked) {
                randomizeRemovalCheckbox.checked = false;
            }
        });
        
        randomizeRemovalCheckbox.addEventListener('click', () => {
            if (randomizeRemovalCheckbox.checked) {
                removeItemCheckbox.checked = false;
            }
        });
        
        okButton.addEventListener('click', () => {
            const hours = parseInt(hoursSelect.value);
            const minutes = parseInt(minutesSelect.value);
            const totalMinutes = hours * 60 + minutes;
            
            if (totalMinutes < 5) {
                alert("Timer must be at least 5 minutes.");
                return;
            }
            
            const totalMs = (hours * 60 + minutes) * 60 * 1000;
            
            let removeItemValue;
            if (randomizeRemovalCheckbox.checked) {
                removeItemValue = "random";
            } else {
                removeItemValue = removeItemCheckbox.checked;
            }
            
            const result = {
                RemoveTimer: CurrentTime + totalMs,
                TimerDuration: totalMs, // Store duration for reuse when applying outfits
                RemoveItem: removeItemValue,
                EnableRandomInput: enableRandomInputCheckbox.checked,
                ShowTimer: showTimerCheckbox.checked
            };
            
            resolve(result);
            document.body.removeChild(overlay);
        });
        
        cancelButton.addEventListener('click', () => {
            resolve(currentConfig);
            document.body.removeChild(overlay);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                resolve(currentConfig);
                document.body.removeChild(overlay);
            }
        });
        
        // Focus OK button
        okButton.focus();
    });
}

// Function to create a password configuration modal
function createPasswordModal(padlockType, currentConfig = {}) {
    return new Promise((resolve) => {
        const lockTypeName = padlockType.replace("Padlock", "");
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 450px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <h3 style="margin-top: 0; color: #333; font-family: Arial, sans-serif;">${lockTypeName} Configuration</h3>
            <p style="color: #666; margin: 10px 0; font-family: Arial, sans-serif; font-size: 14px;">
                Configure the password and hint for this lock
            </p>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Password (4-8 characters):</label>
                <input type="text" id="passwordInput" style="
                    width: 100%;
                    padding: 8px;
                    border: 2px solid #ddd;
                    border-radius: 4px;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    box-sizing: border-box;
                " placeholder="password" value="">
                <div id="passwordCounter" style="
                    margin-top: 5px;
                    color: #666;
                    font-size: 12px;
                    font-family: Arial, sans-serif;
                ">0 / 8 characters</div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Hint (optional, max 140 characters):</label>
                <textarea id="hintInput" style="
                    width: 100%;
                    height: 80px;
                    padding: 8px;
                    border: 2px solid #ddd;
                    border-radius: 4px;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    resize: vertical;
                    box-sizing: border-box;
                " placeholder="Take a guess..."></textarea>
                <div id="hintCounter" style="
                    margin-top: 5px;
                    color: #666;
                    font-size: 12px;
                    font-family: Arial, sans-serif;
                ">0 / 140 characters</div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="passwordCancel" style="
                    padding: 10px 16px;
                    background: #f0f0f0;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    min-width: 70px;
                ">Cancel</button>
                <button id="passwordOk" style="
                    padding: 10px 16px;
                    background: #007bff;
                    color: white;
                    border: 1px solid #007bff;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    min-width: 70px;
                ">OK</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        const passwordInput = modal.querySelector('#passwordInput');
        const hintInput = modal.querySelector('#hintInput');
        const passwordCounter = modal.querySelector('#passwordCounter');
        const hintCounter = modal.querySelector('#hintCounter');
        const okButton = modal.querySelector('#passwordOk');
        const cancelButton = modal.querySelector('#passwordCancel');
        
        // Update password counter and validation
        function updatePasswordCounter() {
            const length = passwordInput.value.length;
            passwordCounter.textContent = `${length} / 8 characters`;
            
            if (length < 4) {
                passwordCounter.style.color = '#dc3545';
                passwordInput.style.borderColor = '#dc3545';
                okButton.disabled = true;
                okButton.style.opacity = '0.5';
                okButton.style.cursor = 'not-allowed';
            } else if (length > 8) {
                passwordCounter.style.color = '#dc3545';
                passwordInput.style.borderColor = '#dc3545';
                okButton.disabled = true;
                okButton.style.opacity = '0.5';
                okButton.style.cursor = 'not-allowed';
            } else {
                passwordCounter.style.color = '#28a745';
                passwordInput.style.borderColor = '#28a745';
                okButton.disabled = false;
                okButton.style.opacity = '1';
                okButton.style.cursor = 'pointer';
            }
        }
        
        // Update hint counter
        function updateHintCounter() {
            const length = hintInput.value.length;
            hintCounter.textContent = `${length} / 140 characters`;
            
            if (length > 140) {
                hintCounter.style.color = '#dc3545';
                hintInput.style.borderColor = '#dc3545';
                okButton.disabled = true;
                okButton.style.opacity = '0.5';
                okButton.style.cursor = 'not-allowed';
            } else {
                hintCounter.style.color = '#666';
                hintInput.style.borderColor = '#ddd';
                // Only enable if password is also valid
                updatePasswordCounter();
            }
        }
        
        // Event listeners
        passwordInput.addEventListener('input', updatePasswordCounter);
        hintInput.addEventListener('input', updateHintCounter);
        
        okButton.addEventListener('click', () => {
            const password = passwordInput.value.trim();
            const hint = hintInput.value.trim();
            
            if (password.length >= 4 && password.length <= 8 && hint.length <= 140) {
                const result = {
                    Password: password || "password",
                    Hint: hint || "Take a guess..."
                };
                resolve(result);
                document.body.removeChild(overlay);
            }
        });
        
        cancelButton.addEventListener('click', () => {
            resolve(null);
            document.body.removeChild(overlay);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                resolve(null);
                document.body.removeChild(overlay);
            }
        });
        
        // Initialize counters and focus password field
        updatePasswordCounter();
        updateHintCounter();
        passwordInput.focus();
        passwordInput.setSelectionRange(passwordInput.value.length, passwordInput.value.length);
    });
}

// Function to create a timer password configuration modal
function createTimerPasswordModal(padlockType, currentConfig = {}) {
    return new Promise((resolve) => {
        // Determine max time based on padlock type (should be 4 hours for TimerPasswordPadlock)
        const maxHours = 4;
        const lockTypeName = padlockType.replace("Padlock", "");
        
        // Create hour options
        const hourOptions = [];
        for (let i = 0; i <= maxHours; i++) {
            hourOptions.push(i);
        }
        
        // Minute options (include 5 for BC default, then 15-minute increments)
        const minuteOptions = [0, 5, 15, 30, 45];
        
        // Parse current config or use defaults
        let currentHours = 0;
        let currentMinutes = 5;
        
        if (currentConfig.RemoveTimer && currentConfig.RemoveTimer > CurrentTime) {
            const remainingMs = currentConfig.RemoveTimer - CurrentTime;
            currentHours = Math.floor(remainingMs / (60 * 60 * 1000));
            currentMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
            
            // Round minutes to nearest available option
            const availableMinutes = [0, 5, 15, 30, 45];
            currentMinutes = availableMinutes.reduce((prev, curr) => 
                Math.abs(curr - currentMinutes) < Math.abs(prev - currentMinutes) ? curr : prev
            );
            if (currentMinutes >= 60) {
                currentHours += Math.floor(currentMinutes / 60);
                currentMinutes = currentMinutes % 60;
            }
            
            // Ensure we don't exceed max hours
            if (currentHours > maxHours) {
                currentHours = maxHours;
                currentMinutes = 0;
            }
        }
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        // Create hour dropdown options
        const hourOptionsHTML = hourOptions.map(h => 
            `<option value="${h}" ${h === currentHours ? 'selected' : ''}>${h}</option>`
        ).join('');
        
        // Create minute dropdown options
        const minuteOptionsHTML = minuteOptions.map(m => 
            `<option value="${m}" ${m === currentMinutes ? 'selected' : ''}>${m}</option>`
        ).join('');
        
        modal.innerHTML = `
            <h3 style="margin-top: 0; color: #333; font-family: Arial, sans-serif;">${lockTypeName} Configuration</h3>
            <p style="color: #666; margin: 10px 0; font-family: Arial, sans-serif; font-size: 14px;">
                Configure password, hint, and timer settings for this lock (max 4 hours)
            </p>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Password (4-8 characters):</label>
                <input type="text" id="passwordInput" style="
                    width: 100%;
                    padding: 8px;
                    border: 2px solid #ddd;
                    border-radius: 4px;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    box-sizing: border-box;
                " placeholder="password" value="">
                <div id="passwordCounter" style="
                    margin-top: 5px;
                    color: #666;
                    font-size: 12px;
                    font-family: Arial, sans-serif;
                ">0 / 8 characters</div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Hint (optional, max 140 characters):</label>
                <textarea id="hintInput" style="
                    width: 100%;
                    height: 60px;
                    padding: 8px;
                    border: 2px solid #ddd;
                    border-radius: 4px;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    resize: vertical;
                    box-sizing: border-box;
                " placeholder="Take a guess..."></textarea>
                <div id="hintCounter" style="
                    margin-top: 5px;
                    color: #666;
                    font-size: 12px;
                    font-family: Arial, sans-serif;
                ">0 / 140 characters</div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Timer Duration:</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <select id="timerHours" style="
                        padding: 8px;
                        border: 2px solid #ddd;
                        border-radius: 4px;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        background: white;
                    ">
                        ${hourOptionsHTML}
                    </select>
                    <span style="color: #666;">hours</span>
                    <select id="timerMinutes" style="
                        padding: 8px;
                        border: 2px solid #ddd;
                        border-radius: 4px;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        background: white;
                    ">
                        ${minuteOptionsHTML}
                    </select>
                    <span style="color: #666;">minutes</span>
                </div>

            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="removeItem" ${currentConfig.RemoveItem === true || currentConfig.RemoveItem === undefined ? 'checked' : ''} style="margin-right: 8px;">
                    <span style="color: #333; font-size: 14px;">Remove item when timer expires</span>
                </label>
            </div>
            
            <div style="margin-bottom: 15px; margin-left: 16px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="randomizeRemoval" ${currentConfig.RemoveItem === "random" ? 'checked' : ''} style="margin-right: 8px;">
                    <span style="color: #666; font-size: 13px;">Randomize item removal</span>
                </label>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="enableRandomInput" ${currentConfig.EnableRandomInput !== false ? 'checked' : ''} style="margin-right: 8px;">
                    <span style="color: #333; font-size: 14px;">Enable random input from others</span>
                </label>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="showTimer" ${currentConfig.ShowTimer !== false ? 'checked' : ''} style="margin-right: 8px;">
                    <span style="color: #333; font-size: 14px;">Show timer to wearer</span>
                </label>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="timerPasswordCancel" style="
                    padding: 10px 16px;
                    background: #f0f0f0;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    min-width: 70px;
                ">Cancel</button>
                <button id="timerPasswordOk" style="
                    padding: 10px 16px;
                    background: #007bff;
                    color: white;
                    border: 1px solid #007bff;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    min-width: 70px;
                ">OK</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        const passwordInput = modal.querySelector('#passwordInput');
        const hintInput = modal.querySelector('#hintInput');
        const hoursSelect = modal.querySelector('#timerHours');
        const minutesSelect = modal.querySelector('#timerMinutes');
        const passwordCounter = modal.querySelector('#passwordCounter');
        const hintCounter = modal.querySelector('#hintCounter');
        const removeItemCheckbox = modal.querySelector('#removeItem');
        const randomizeRemovalCheckbox = modal.querySelector('#randomizeRemoval');
        const enableRandomInputCheckbox = modal.querySelector('#enableRandomInput');
        const showTimerCheckbox = modal.querySelector('#showTimer');
        const okButton = modal.querySelector('#timerPasswordOk');
        const cancelButton = modal.querySelector('#timerPasswordCancel');
        
        // Update password counter and validation
        function updatePasswordCounter() {
            const length = passwordInput.value.length;
            passwordCounter.textContent = `${length} / 8 characters`;
            
            if (length < 4) {
                passwordCounter.style.color = '#dc3545';
                passwordInput.style.borderColor = '#dc3545';
                updateOkButton();
            } else if (length > 8) {
                passwordCounter.style.color = '#dc3545';
                passwordInput.style.borderColor = '#dc3545';
                updateOkButton();
            } else {
                passwordCounter.style.color = '#28a745';
                passwordInput.style.borderColor = '#28a745';
                updateOkButton();
            }
        }
        
        // Update hint counter
        function updateHintCounter() {
            const length = hintInput.value.length;
            hintCounter.textContent = `${length} / 140 characters`;
            
            if (length > 140) {
                hintCounter.style.color = '#dc3545';
                hintInput.style.borderColor = '#dc3545';
                updateOkButton();
            } else {
                hintCounter.style.color = '#666';
                hintInput.style.borderColor = '#ddd';
                updateOkButton();
            }
        }
        
        // Update total time and enforce limits
        function updateTotalTime() {
            let hours = parseInt(hoursSelect.value);
            let minutes = parseInt(minutesSelect.value);
            
            // Enforce 4-hour limit
            const totalMinutes = hours * 60 + minutes;
            if (totalMinutes > 240) { // 4 hours = 240 minutes
                // Reset to 4 hours exactly
                hours = 4;
                minutes = 0;
                hoursSelect.value = hours;
                minutesSelect.value = minutes;
            }
            
            updateOkButton();
        }
        
        // Update OK button state based on all validations
        function updateOkButton() {
            const passwordLength = passwordInput.value.length;
            const hintLength = hintInput.value.length;
            const hours = parseInt(hoursSelect.value);
            const minutes = parseInt(minutesSelect.value);
            
            const totalMinutes = hours * 60 + minutes;
            const isValid = passwordLength >= 4 && passwordLength <= 8 && 
                           hintLength <= 140 && 
                           totalMinutes >= 5;
            
            if (isValid) {
                okButton.disabled = false;
                okButton.style.opacity = '1';
                okButton.style.cursor = 'pointer';
            } else {
                okButton.disabled = true;
                okButton.style.opacity = '0.5';
                okButton.style.cursor = 'not-allowed';
            }
        }
        
        // Event listeners
        passwordInput.addEventListener('input', updatePasswordCounter);
        hintInput.addEventListener('input', updateHintCounter);
        hoursSelect.addEventListener('change', updateTotalTime);
        minutesSelect.addEventListener('change', updateTotalTime);
        
        // Initialize displays
        updatePasswordCounter();
        updateHintCounter();
        updateTotalTime();
        
        // Handle checkbox interactions - ensure mutual exclusion
        removeItemCheckbox.addEventListener('click', () => {
            if (removeItemCheckbox.checked) {
                randomizeRemovalCheckbox.checked = false;
            }
        });
        
        randomizeRemovalCheckbox.addEventListener('click', () => {
            if (randomizeRemovalCheckbox.checked) {
                removeItemCheckbox.checked = false;
            }
        });
        
        okButton.addEventListener('click', () => {
            const password = passwordInput.value.trim();
            const hint = hintInput.value.trim();
            const hours = parseInt(hoursSelect.value);
            const minutes = parseInt(minutesSelect.value);
            
            const totalMinutes = hours * 60 + minutes;
            if (password.length >= 4 && password.length <= 8 && 
                hint.length <= 140 && 
                totalMinutes >= 5) {
                
                const totalMs = (hours * 60 + minutes) * 60 * 1000;
                
                let removeItemValue;
                if (randomizeRemovalCheckbox.checked) {
                    removeItemValue = "random";
                } else {
                    removeItemValue = removeItemCheckbox.checked;
                }
                
                const result = {
                    Password: password || "password",
                    Hint: hint || "Take a guess...",
                    RemoveTimer: CurrentTime + totalMs,
                    TimerDuration: totalMs, // Store duration for reuse when applying outfits
                    RemoveItem: removeItemValue,
                    EnableRandomInput: enableRandomInputCheckbox.checked,
                    ShowTimer: showTimerCheckbox.checked
                };
                
                resolve(result);
                document.body.removeChild(overlay);
            }
        });
        
        cancelButton.addEventListener('click', () => {
            resolve(currentConfig);
            document.body.removeChild(overlay);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                resolve(currentConfig);
                document.body.removeChild(overlay);
            }
        });
        
        // Focus password field
        passwordInput.focus();
        passwordInput.setSelectionRange(passwordInput.value.length, passwordInput.value.length);
    });
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createInputModal,
        createTimerModal,
        createPasswordModal,
        createTimerPasswordModal
    };
}

// Global exports for direct script usage
window.BCOM_ModalSystem = {
    createInputModal,
    createTimerModal,
    createPasswordModal,
    createTimerPasswordModal
};