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

// Appearance Options modal — per-outfit slot exclusion (X marks). Outfits apply
// "exactly as saved" by default; the X excludes that slot from the apply (keeps
// the player's current item there). Saving the checked outfit as a new variant
// bakes the exclusions in, producing a filtered copy.
//
// Visual key:
//   default row — slot included; yellow background if the outfit has an item there,
//                 light grey if the slot is only currently occupied on the player
//   X row (red) — excluded from this outfit's apply/save
//
// Slots are filtered to the union of (groups in the outfit) and (groups currently
// on the player) — empty-on-both slots are hidden to declutter the list.
function createAppearanceOptionsModal(character, outfitName, outfitData) {
    return new Promise((resolve) => {
        const mi = window.BCOM_ModInitializer;
        if (!outfitName) {
            console.warn("BCOM: createAppearanceOptionsModal called with no outfitName");
            resolve(false);
            return;
        }

        // Working copy of this outfit's exclusion set. Committed on Done.
        const excluded = new Set(mi.getOutfitExclusions(outfitName));

        // Group name -> description (display) and raw item (comparison), for both the
        // saved outfit and the character's current appearance.
        const outfitMap = {};
        const outfitItemByGroup = {};
        if (Array.isArray(outfitData)) {
            for (const item of outfitData) {
                if (!item || !item.Group || !item.Name) continue;
                const asset = (typeof AssetGet === 'function')
                    ? AssetGet(character?.AssetFamily || "Female3DCG", item.Group, item.Name)
                    : null;
                const desc = item.Craft?.Name || asset?.Description || item.Name;
                outfitMap[item.Group] = desc;
                outfitItemByGroup[item.Group] = item;
            }
        }

        const playerMap = {};
        const currentItemByGroup = {};
        const appearance = (character && Array.isArray(character.Appearance)) ? character.Appearance : [];
        for (const item of appearance) {
            const group = item?.Asset?.Group;
            if (!group || group.Category !== "Appearance") continue;
            const desc = item.Craft?.Name || item.Asset.Description || item.Asset.Name;
            playerMap[group.Name] = desc;
            currentItemByGroup[group.Name] = item;
        }

        // Is the outfit's item for a slot 1-to-1 identical to what the character already
        // wears (same asset + color + properties + craft)? Identical slots are no-ops on
        // apply, so they're hidden to declutter the list. The check is conservative:
        // anything it can't confirm as identical is shown.
        const canon = (v) => {
            if (Array.isArray(v)) return v.map(canon);
            if (v && typeof v === 'object') {
                const o = {};
                for (const k of Object.keys(v).sort()) {
                    if (v[k] === undefined) continue;
                    o[k] = canon(v[k]);
                }
                return o;
            }
            return v;
        };
        const jsonEq = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
        const normColor = (color) => {
            if (color == null) return "Default";
            if (Array.isArray(color)) return color.map(c => (c == null || c === "") ? "Default" : c);
            if (color === "" || String(color).toLowerCase() === "default") return "Default";
            return color;
        };
        const slotIsIdentical = (name) => {
            const o = outfitItemByGroup[name];
            const c = currentItemByGroup[name];
            if (!o || !c) return false; // only one side has an item — always show
            if (o.Name !== c.Asset?.Name) return false;
            if (!jsonEq(normColor(o.Color), normColor(c.Color))) return false;
            if (!jsonEq(o.Property || null, c.Property || null)) return false;
            if (!jsonEq(o.Craft || null, c.Craft || null)) return false;
            return true;
        };

        // Build the slot list: appearance groups where the outfit OR the player has an
        // item, minus slots that are 1-to-1 identical (no-ops). Each slot is bucketed
        // into a section from its AssetGroup flags, ordered like the base-game wardrobe:
        // clothing → cosplay → hair → body; alphabetical by description within a section.
        const slotNames = new Set([
            ...Object.keys(outfitMap).filter(n => {
                const g = (typeof AssetGroup !== 'undefined' ? AssetGroup : []).find(gg => gg.Name === n);
                return g && g.Category === "Appearance";
            }),
            ...Object.keys(playerMap)
        ]);
        const sectionOf = (g, name) => {
            if (g?.Clothing) return "clothing";
            if (g?.BodyCosplay) return "cosplay";
            if (name.startsWith("Hair") || name === "Beard") return "hair";
            return "body";
        };
        const slots = Array.from(slotNames)
            .filter(name => !slotIsIdentical(name))
            .map(name => {
                const g = (typeof AssetGroup !== 'undefined' ? AssetGroup : []).find(gg => gg.Name === name);
                return {
                    name,
                    description: g?.Description || name,
                    section: sectionOf(g, name)
                };
            });

        // Section definitions in display order. Empty sections are skipped at render.
        const SECTION_ORDER = [
            { key: "clothing", label: "Clothing" },
            { key: "cosplay", label: "Cosplay" },
            { key: "hair", label: "Hair" },
            { key: "body", label: "Body" }
        ];
        const sectionSlots = {};
        for (const def of SECTION_ORDER) {
            sectionSlots[def.key] = slots
                .filter(s => s.section === def.key)
                .sort((a, b) => a.description.localeCompare(b.description));
        }

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex; justify-content: center; align-items: center;
            z-index: 10000;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; padding: 20px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 600px; width: 90%; max-height: 85vh;
            display: flex; flex-direction: column;
            font-family: Arial, sans-serif;
        `;

        const escapeAttr = (s) => String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');

        // One rule everywhere: a CHECKED (marked) box means "keep my current slot —
        // leave it alone on apply." An empty box means the outfit's action happens.
        //   • kept + outfit has an item:
        //       body  → ✓ green "keep your body" (body is kept by default; opt in by
        //               unchecking)
        //       other → ✕ red "exclude" (you chose to skip the outfit's item)
        //   • kept + only you have an item → ✓ green "keep" (it isn't removed on apply)
        //   • not kept → empty box: yellow if the outfit fills the slot (it'll be applied),
        //     grey if only you have one (it'll be removed).
        const styleFor = (optIn, hasOutfitItem, kept) => {
            if (!kept) {
                return {
                    bg: hasOutfitItem ? '#fff9c4' : '#eceff1',
                    border: hasOutfitItem ? '#fbc02d' : '#cfd8dc',
                    mark: '',
                    markColor: '#999'
                };
            }
            if (hasOutfitItem && !optIn) {
                return { bg: '#ffcdd2', border: '#c62828', mark: '✕', markColor: '#c62828' };
            }
            return { bg: '#c8e6c9', border: '#2e7d32', mark: '✓', markColor: '#2e7d32' };
        };

        const renderRow = (slot) => {
            const outfitItem = outfitMap[slot.name];
            const playerItem = playerMap[slot.name];
            const optIn = slot.section === 'body';
            const toggled = excluded.has(slot.name);
            const hasOutfitItem = !!outfitItem;
            // Matches shouldApplyGroup: body applies only when opted in (in set); every
            // other section applies by default (out of set). kept = the inverse.
            const willApply = optIn ? toggled : !toggled;
            const kept = !willApply;
            const s = styleFor(optIn, hasOutfitItem, kept);

            const tipParts = [];
            if (outfitItem) tipParts.push(`Outfit: ${outfitItem}`);
            if (playerItem) tipParts.push(`Currently: ${playerItem}`);
            if (!tipParts.length) tipParts.push("Empty");
            if (kept) {
                if (optIn) {
                    tipParts.push("Keeping your body — uncheck to apply the outfit's version");
                } else if (hasOutfitItem) {
                    tipParts.push("Excluded — keeping what you're wearing, not the outfit's item");
                } else {
                    tipParts.push("Keeping your current item (it won't be removed on apply)");
                }
            } else if (hasOutfitItem) {
                tipParts.push("Will apply the outfit's item — check to keep yours instead");
            } else if (slot.section === 'clothing') {
                tipParts.push("Will be removed on apply — check to keep it");
            } else {
                tipParts.push("Kept (the outfit doesn't include this slot)");
            }

            return `
                <div class="aopt-row" data-group="${escapeAttr(slot.name)}"
                    data-has-outfit="${hasOutfitItem ? '1' : '0'}"
                    data-optin="${optIn ? '1' : '0'}"
                    title="${escapeAttr(tipParts.join('\n'))}"
                    style="
                        display: flex; align-items: center; gap: 10px;
                        padding: 6px 10px; margin: 2px 0; border-radius: 4px;
                        cursor: pointer; user-select: none;
                        background: ${s.bg};
                        border: 1px solid ${s.border};
                    ">
                    <span class="aopt-mark" style="
                        display: inline-block; width: 18px; height: 18px;
                        border: 2px solid #555; border-radius: 3px;
                        background: white; text-align: center;
                        font-weight: bold; font-size: 14px; line-height: 16px;
                        color: ${s.markColor};
                    ">${s.mark}</span>
                    <span style="flex: 1; color: #333; font-size: 14px;">${escapeAttr(slot.description)}</span>
                    <span style="color: #555; font-size: 12px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${escapeAttr(outfitItem || playerItem || '')}
                    </span>
                </div>
            `;
        };

        const rowsHTML = SECTION_ORDER.map(def => {
            const list = sectionSlots[def.key];
            if (!list.length) return '';
            return `
                <div class="aopt-section">
                    <div class="aopt-section-header" data-section="${def.key}" style="
                        display: flex; align-items: center; gap: 8px;
                        padding: 6px 8px; margin: 4px 0 2px 0; border-radius: 4px;
                        cursor: pointer; user-select: none;
                        background: #e3e7ea; border: 1px solid #cfd8dc;
                        font-weight: bold; font-size: 13px; color: #37474f;
                    ">
                        <span class="aopt-caret" style="display:inline-block; width:12px;">▼</span>
                        <span style="flex:1;">${escapeAttr(def.label)}</span>
                        <span style="color:#78909c; font-weight:normal;">${list.length}</span>
                        <span class="aopt-section-toggle-wrap" title="Skip all in this section (keep what you're wearing)"
                            style="display:inline-flex; align-items:center; gap:4px; font-weight:normal; font-size:11px; color:#546e7a; cursor:pointer;">
                            skip all
                            <input type="checkbox" class="aopt-section-toggle" data-section="${def.key}"
                                style="width:14px; height:14px; cursor:pointer; margin:0;">
                        </span>
                    </div>
                    <div class="aopt-section-body" data-section-body="${def.key}">
                        ${list.map(renderRow).join('')}
                    </div>
                </div>
            `;
        }).join('');

        const heading = `Appearance Options — ${escapeAttr(outfitName)}`;
        modal.innerHTML = `
            <h3 style="margin: 0 0 6px 0; color: #333;">${heading}</h3>
            <p style="color: #666; margin: 0 0 10px 0; font-size: 13px;">
                A <b>checked</b> slot is kept as-is on apply; an <b>empty</b> one takes the outfit's action. Click a slot to toggle it:
                <br><span style="color: #c9a300;">Yellow</span> = the outfit's item will be applied →
                check it for <span style="color: #c62828;">✕ Exclude</span> (keep what you're wearing).
                <br><span style="color: #607d8b;">Grey</span> = only you have an item here →
                check it for <span style="color: #2e7d32;">✓ Keep</span> (otherwise it's removed on apply).
                <br><b>Body</b> slots are <span style="color: #2e7d32;">✓ checked</span> (kept) by default so your body isn't changed →
                uncheck one to apply the outfit's version. Use <b>skip all</b> on a section header to keep the whole section.
            </p>
            <div id="aoptList" style="
                flex: 1; overflow-y: auto;
                border: 1px solid #ddd; border-radius: 4px;
                padding: 4px; background: #fafafa;
                min-height: 200px; max-height: 55vh;
            ">${rowsHTML || '<div style="padding:12px;color:#888;font-size:13px;">No appearance slots to configure for this outfit.</div>'}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                <button id="aoptClear" style="
                    padding: 8px 14px; background: #f0f0f0;
                    border: 1px solid #ccc; border-radius: 4px;
                    cursor: pointer; font-size: 13px;
                ">Clear All</button>
                <div>
                    <button id="aoptCancel" style="
                        padding: 8px 14px; margin-right: 8px;
                        background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px;
                        cursor: pointer; font-size: 13px;
                    ">Cancel</button>
                    <button id="aoptDone" style="
                        padding: 8px 14px; background: #007bff; color: white;
                        border: 1px solid #007bff; border-radius: 4px;
                        cursor: pointer; font-size: 13px;
                    ">Done</button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const list = modal.querySelector('#aoptList');
        const clearBtn = modal.querySelector('#aoptClear');
        const cancelBtn = modal.querySelector('#aoptCancel');
        const doneBtn = modal.querySelector('#aoptDone');

        function repaintRow(row) {
            const group = row.dataset.group;
            const optIn = row.dataset.optin === '1';
            const hasOutfitItem = row.dataset.hasOutfit === '1';
            const toggled = excluded.has(group);
            const willApply = optIn ? toggled : !toggled;
            const s = styleFor(optIn, hasOutfitItem, !willApply);
            row.style.background = s.bg;
            row.style.borderColor = s.border;
            const mark = row.querySelector('.aopt-mark');
            mark.textContent = s.mark;
            mark.style.color = s.markColor;
        }

        // "Kept" (a section's skip-all state) maps to set membership differently per
        // section: body is opt-in (kept = NOT in the set), every other section is
        // opt-out (kept = IN the set).
        const keptMeansInSet = (key) => key !== 'body';

        // Skip all = mark every row in the section as kept; un-skip = let them apply.
        function setSectionSkip(key, skip) {
            const wantInSet = skip ? keptMeansInSet(key) : !keptMeansInSet(key);
            list.querySelectorAll(`[data-section-body="${key}"] .aopt-row`).forEach(row => {
                if (wantInSet) excluded.add(row.dataset.group);
                else excluded.delete(row.dataset.group);
                repaintRow(row);
            });
            refreshSectionToggle(key);
        }

        // Sync a section's "skip all" checkbox: checked = all kept, unchecked = none
        // kept, indeterminate = mixed.
        function refreshSectionToggle(key) {
            const cb = list.querySelector(`.aopt-section-toggle[data-section="${key}"]`);
            if (!cb) return;
            const rows = list.querySelectorAll(`[data-section-body="${key}"] .aopt-row`);
            let kept = 0;
            rows.forEach(row => {
                const inSet = excluded.has(row.dataset.group);
                if (keptMeansInSet(key) ? inSet : !inSet) kept++;
            });
            if (kept === 0) { cb.checked = false; cb.indeterminate = false; }
            else if (kept === rows.length) { cb.checked = true; cb.indeterminate = false; }
            else { cb.indeterminate = true; }
        }

        list.addEventListener('click', (e) => {
            // Section "skip all" checkbox (handled before the header collapse, so a
            // click here never collapses the section).
            const toggleWrap = e.target.closest('.aopt-section-toggle-wrap');
            if (toggleWrap) {
                const cb = toggleWrap.querySelector('.aopt-section-toggle');
                if (e.target !== cb) cb.checked = !cb.checked; // clicked the label, not the box
                cb.indeterminate = false;
                setSectionSkip(cb.dataset.section, cb.checked);
                return;
            }

            // Section header toggles collapse/expand of its body.
            const header = e.target.closest('.aopt-section-header');
            if (header) {
                const key = header.dataset.section;
                const body = list.querySelector(`[data-section-body="${key}"]`);
                const caret = header.querySelector('.aopt-caret');
                if (body) {
                    const collapsed = body.style.display === 'none';
                    body.style.display = collapsed ? '' : 'none';
                    if (caret) caret.textContent = collapsed ? '▼' : '▶';
                }
                return;
            }

            const row = e.target.closest('.aopt-row');
            if (!row) return;
            const group = row.dataset.group;
            if (excluded.has(group)) excluded.delete(group);
            else excluded.add(group);
            repaintRow(row);
            const sb = row.closest('[data-section-body]');
            if (sb) refreshSectionToggle(sb.dataset.section);
        });

        // Set each section checkbox to its initial state (checked / unchecked / mixed).
        SECTION_ORDER.forEach(def => refreshSectionToggle(def.key));

        clearBtn.addEventListener('click', () => {
            excluded.clear();
            list.querySelectorAll('.aopt-row').forEach(repaintRow);
            SECTION_ORDER.forEach(def => refreshSectionToggle(def.key));
        });

        function close(commit) {
            if (commit) mi.setOutfitExclusions(outfitName, excluded);
            document.body.removeChild(overlay);
            resolve(commit);
        }

        doneBtn.addEventListener('click', () => close(true));
        cancelBtn.addEventListener('click', () => close(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    });
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createInputModal,
        createTimerModal,
        createPasswordModal,
        createTimerPasswordModal,
        createAppearanceOptionsModal
    };
}

// Global exports for direct script usage
window.BCOM_ModalSystem = {
    createInputModal,
    createTimerModal,
    createPasswordModal,
    createTimerPasswordModal,
    createAppearanceOptionsModal
};