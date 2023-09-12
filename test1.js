document.addEventListener('DOMContentLoaded', async () => {
    
    //********************************************************************************
    //// DOM Element Selection
    //********************************************************************************
        const toggleButton = document.querySelector('#toggleInventoryForm');
        const modalContainer = document.querySelector('#modalContainer');
        const editModalContainer = document.querySelector('#editModalContainer');
        const cartModalContainer = document.querySelector('#cartModalContainer');
        const overlay = document.querySelector('#overlay');
        const addFormCloseButton = document.querySelector('#addForm-closeButton');
        const editFormCloseButton = document.querySelector('#editForm-closeButton');
        const cartFormCloseButton = document.querySelector('#cartForm-closeButton');
        const addInventoryForm = document.querySelector('#addInventoryForm');
        const editInventoryForm = document.querySelector('#editInventoryForm');
        const editProductNameInput = document.querySelector('#editProductName');
        const editReceivedQuantityInput = document.querySelector('#editReceivedQuantity');
        const editQuantityInStockInput = document.querySelector('#editQuantityInStock');
        const editCostPriceInput = document.querySelector('#editCostPrice');
        const editSellingPriceInput = document.querySelector('#editSellingPrice');
        const editSupplierInput = document.querySelector('#editSupplier');
        const editSKUInput = document.querySelector('#editSKU');
        const editDescriptionInput = document.querySelector('#editDescription');
        const editFormItemIdInput = document.querySelector('#editFormItemId');
        const cartItemId = document.querySelector('#cartItemId');
        const orderCost = document.querySelector('#orderCost');
        const deleteButton = document.querySelector('#deleteButton');
        const decreaseButton = document.querySelector('#decreaseButton');
        const increaseButton = document.querySelector('#increaseButton');
        const itemQuantityInput = document.querySelector('#itemQuantity');
        const cartForm = document.querySelector('#cartForm');
        const sellingPriceDisplay = document.querySelector('#sellingPriceDisplay');
        const cartItemsElements = document.querySelector('#cartItems');
        const cartTotalPriceElement = document.querySelector('#cartTotalPrice');
        const checkoutBtn = document.querySelector('#checkoutBtn');
    
        let inventory; 
     
    //********************************************************************************
    ////Display add Inventory form 
    //********************************************************************************
        toggleButton.addEventListener('click', () => {
            modalContainer.style.display = 'block';
            overlay.style.display = 'block';
        });
    
    //********************************************************************************
    ////Utility functions  
    //********************************************************************************
        // function closeModal(modal, overlay) {
            
        //     if(modal.id === 'cartModalContainer') {
        //         itemQuantityInput.value = 1; 
        //     }
    
        //     modal.style.display = 'none';
        //     overlay.style.display = 'none';
        // }
    
        function closeModal(modal, overlay) {
            if (modal.id === 'cartModalContainer') {
                itemQuantityInput.value = 1;
                // Remove specific event listeners from itemQuantityInput, decreaseButton, and increaseButton
                itemQuantityInput.removeEventListener('input', handleItemQuantityInput);
                decreaseButton.removeEventListener('click', handleDecreaseButtonClick);
                increaseButton.removeEventListener('click', handleIncreaseButtonClick);
            }
        
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }
        
        function updateTableWithData(data) {
            $('#myTable').DataTable().clear().rows.add(data).draw();
        }
    
        function getFormDataFromForm(form) {
    
            if(form === addInventoryForm){
                const formData = {
                    product_name: form.querySelector('#product_name').value,
                    received_quantity: form.querySelector('#received_quantity').value,
                    cost_price: form.querySelector('#cost_price').value,
                    selling_price: form.querySelector('#selling_price').value,
                    supplier: form.querySelector('#supplier').value,
                    sku: form.querySelector('#sku').value,
                    description: form.querySelector('#description').value
                };
        
                return formData;
            }
        
            else if(form === editInventoryForm){
                const formData = {
                    productName: editProductNameInput.value,
                    receivedQuantity: editReceivedQuantityInput.value,
                    quantityInStock : editQuantityInStockInput.value,
                    costPrice: editCostPriceInput.value,
                    sellingPrice: editSellingPriceInput.value,
                    supplier: editSupplierInput.value,
                    sku: editSKUInput.value,
                    description: editDescriptionInput.value,
                    itemId: editFormItemIdInput.value
                };
        
                return formData;
            }
        }
        
        async function fetchInventoryData() {
            try {
                const response = await fetch('/getInventoryData');
    
                if (!response.ok) {
                    throw new Error('Failed to fetch inventory data');
                }
    
                const data = await response.json();
    
                data.forEach(item => {
                    item['Edit'] = '<button id="editButton" class="tableButton">Edit</button>';
                    item['Add to Cart'] = '<button id="cartButton" class="tableButton">Add to Cart</button>';
                });
    
                return data;
            } 
            catch (error) {
                console.error('Error fetching inventory data:', error);
                return [];
            }
        }; 
    
        function calculateTotalValue(currentQuantity, sellingPrice) {
            return currentQuantity * sellingPrice;
        }
    
        async function populateCartItems() {
            try {
                const response = await fetch('/getCartItems');
                const cartItems = await response.json();
    
                cartItemsElements.innerHTML = '';
    
                cartItems.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('cartItemCard');
                    itemDiv.innerHTML = `
                        <input type="checkbox" name="cartItem" value="${item.itemId}">
                        <p><span>${item.quantity}x</span> ${item.productName}</p>
                        <p class="total-price"><strong>Total Price:</strong> ${formatAsMoney(item.totalPrice)}</p>
                    `;
    
                    cartItemsElements.appendChild(itemDiv);
                });
    
                
            if (cartItemsElements.querySelectorAll('input[name="cartItem"]:checked').length === 0) {
                cartTotalPriceElement.innerHTML = `<p>Total Price: ${formatAsMoney(0)}</p>`;
            }
    
            } 
            catch (error) {
                console.error('Error fetching cart items:', error);
            }
        }
    
        function formatAsMoney(amount, decimalPlaces = 2) {
            return `&#8369;${amount.toLocaleString(undefined, { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces })}`;
        }
    
    //********************************************************************************
    ////Event listener for close buttons 
    //********************************************************************************
        addFormCloseButton.addEventListener('click', () => closeModal(modalContainer, overlay));
        editFormCloseButton.addEventListener('click', () => closeModal(editModalContainer, overlay));
        cartFormCloseButton.addEventListener('click', () => {closeModal(cartModalContainer, overlay);});
     
    //********************************************************************************
    ////Add Inventory Form submission
    //********************************************************************************
        addInventoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = getFormDataFromForm(addInventoryForm); 
        
            try {
                const response = await fetch('/addInventory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
    
                const data = await response.json();
    
                fetchInventoryData().then((data) => {
                    updateTableWithData(data);
                });
    
            } 
            catch (error) {
                console.error('Error:', error);
            }
    
            addInventoryForm.reset();
        });
    
    //********************************************************************************
    ////Set data for tables
    //********************************************************************************    
        const showEditColumn = userType !== 'basic-user';
    
        fetchInventoryData().then((data) => {
            // Define the columns array based on the showEditColumn flag
            const columns = [
                { data: 'sku' },
                { data: 'product_name' },
                { data: 'quantity_received' },
                { data: 'quantity_inStock' },
                { data: 'cost_price' },
                { data: 'selling_price' },
                { data: 'supplier' },
                { data: 'updated_at' },
                { data: 'Add to Cart' },
            ];
    
            // Conditionally add the "Edit" column to the columns array
            if (showEditColumn) {
                columns.splice(8, 0, { data: 'Edit' });
            }
    
            $('#myTable').DataTable({
                data: data,
                columns: columns,
            });
        }).catch((error) => {
            console.error("Error fetching data:", error);
        });
    
    //********************************************************************************
    ////Attached event listener for edit and add to cart buttons inside the table
    //******************************************************************************** 
        document.querySelector('#myTable').addEventListener('click', async (event) => {
            const targetId = event.target.id;
            if (targetId === 'editButton') {
                await handleEditButtonClick(event.target);
            };
    
            if (targetId === 'cartButton') {
                await handleCartButtonClick(event.target);
            };
        });
    
        async function fetchData(itemId) {
            try {
                const response = await fetch(`/getInventoryItem/${itemId}`);
    
                if (!response.ok) {
                    throw new Error('Failed to fetch inventory item');
                };
    
                return await response.json();
            } catch (error) {
                console.error('Error fetching inventory item:', error);
                return null;
            };
        };
    
        async function handleEditButtonClick(editButton) {
            const table = $('#myTable').DataTable();
            const rowData = table.row(editButton.closest('tr')).data();
            const itemId = rowData._id;
    
            editModalContainer.style.display = 'block';
            overlay.style.display = 'block';
            
            const inventoryItem = await fetchData(itemId);
    
            if (inventoryItem) {
                
                editProductNameInput.value = inventoryItem.product_name;
                editReceivedQuantityInput.value = inventoryItem.quantity_received;
                editQuantityInStockInput.value = inventoryItem.quantity_inStock;
                editCostPriceInput.value = inventoryItem.cost_price;
                editSellingPriceInput.value = inventoryItem.selling_price;
                editSupplierInput.value = inventoryItem.supplier;
                editSKUInput.value = inventoryItem.sku;
                editDescriptionInput.value = inventoryItem.description;
                editFormItemIdInput.value = itemId;
            };
        };
    
        async function handleCartButtonClick(cartButton) {
            const table = $('#myTable').DataTable();
            const rowData = table.row(cartButton.closest('tr')).data();
            const itemId = rowData._id;
            const inventoryItem = await fetchData(itemId);
        
            orderCost.value = rowData.selling_price;
        
            if (inventoryItem) {
                const productNameElement = document.querySelector('#productName');
                cartItemId.value = itemId;
        
                productNameElement.textContent = `Product Name: ${inventoryItem.product_name}`;
                sellingPriceDisplay.textContent = `Total Value: Php ${inventoryItem.selling_price}`;
    
                const handleItemQuantityInput = function() {
                    const enteredQuantity = parseInt(itemQuantityInput.value);
            
                    if (enteredQuantity > inventoryItem.quantity_inStock) {
                        itemQuantityInput.value = inventoryItem.quantity_inStock;
                    } else if (enteredQuantity < 1) {
                        itemQuantityInput.value = 1;
                    } else {
                        itemQuantityInput.value = enteredQuantity;
                    }
            
                    updateTotalValue();
                }
            
                const handleDecreaseButtonClick = function() {
                    if (parseInt(itemQuantityInput.value) > 1) {
                        itemQuantityInput.value--;
                        updateTotalValue();
                    }
                }
            
                const handleIncreaseButtonClick = function() {
                    if (parseInt(itemQuantityInput.value) < inventoryItem.quantity_inStock) {
                        itemQuantityInput.value++;
                        updateTotalValue();
                    }
                }
            
                // Add new event listeners with stopImmediatePropagation()
                itemQuantityInput.addEventListener('input', handleItemQuantityInput);
                decreaseButton.addEventListener('click', handleDecreaseButtonClick);
                increaseButton.addEventListener('click', handleIncreaseButtonClick);
        
                cartModalContainer.style.display = 'block';
                overlay.style.display = 'block';
            }
        
            function updateTotalValue() {
                totalPrice = calculateTotalValue(itemQuantityInput.value, inventoryItem.selling_price);
                // Round the totalPrice to 2 decimal places
                totalPrice = parseFloat(totalPrice.toFixed(2));
                sellingPriceDisplay.textContent = `Total Value: Php ${totalPrice}`;
                orderCost.value = totalPrice;
            }
        }
    
    //********************************************************************************
    ////Edit inventory form submission
    //********************************************************************************
        editInventoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = getFormDataFromForm(editInventoryForm); 
            
            try {
                const response = await fetch('/editInventoryItem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
    
                const data = await response.json();
    
    
                closeModal(editModalContainer, overlay);
    
                fetchInventoryData().then((data) => {
                    updateTableWithData(data);
                });
    
            } 
            catch (error) {
                console.error('Error:', error);
            }
        });
    
    //********************************************************************************
    ////Delete inventory button event listener
    //********************************************************************************
        deleteButton.addEventListener('click', async (event) => {
            //fetch the item id here
            const itemId = editFormItemIdInput.value;
    
            try {
                const response = await fetch(`/deleteInventoryItem/${itemId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete inventory item');
                }
                populateCartItems();
                closeModal(editModalContainer, overlay);
    
                fetchInventoryData().then((data) => {
                    updateTableWithData(data);
                });
    
            } catch (error) {
                console.error('Error deleting inventory item:', error);
            }
    
        })
    //********************************************************************************
    ////cartForm event listener for submitting items to cart collection
    //********************************************************************************
        cartForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
    
            const formData = {
                itemId : cartItemId.value,
                itemQuantity: itemQuantityInput.value,
                totalPrice: orderCost.value
            }
    
            try {
                const response = await fetch('/addToCart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
    
                const data = await response.json();
                
                console.log(data);
                populateCartItems();
                closeModal(cartModalContainer, overlay);
            } 
            catch (error) {
                console.error('Error:', error);
            }
        });
    //********************************************************************************
    ////populate items added to cart
    //********************************************************************************
        populateCartItems();
    //********************************************************************************
    ////Remove from cart event listener
    //********************************************************************************
    
        removeBtn.addEventListener('click', async () => {
            const selectedItems = Array.from(cartItemsElements.querySelectorAll('input[name="cartItem"]:checked'))
                .map(checkbox => checkbox.value);
    
            if (selectedItems.length === 0) {
                alert('Please select items to remove from the cart.');
                return;
            }
        
            try {
                const response = await fetch('/removeFromCart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ items: selectedItems })
                });
        
                if (response.ok) {
                    // Refresh the cart items after successful removal
                    populateCartItems();
                } else {
                    console.error('Failed to remove cart items:', response.statusText);
                }
            } catch (error) {
                console.error('Error removing cart items:', error);
            }
        });
    
    //********************************************************************************
    ////Checkout from cart event listener
    //********************************************************************************
    
        checkoutBtn.addEventListener('click', async (event) => {
            try {
                const selectedItems = Array.from(cartItemsElements.querySelectorAll('input[name="cartItem"]:checked'))
                    .map(checkbox => checkbox.value);
    
                console.log(selectedItems);
    
                if (selectedItems.length === 0) {
                    alert('Please select items to checkout.');
                    return;
                }
                // Fetch selected cart items from the server
                const response = await fetch('/getCartItems');
                const cartItems = await response.json();
    
                // Filter selected cart items based on selectedItems array
                const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.itemId));
    
                // Calculate total price for the selected items
                const totalPrice = selectedCartItems.reduce((total, item) => total + item.totalPrice, 0);
    
                // Create a new sales document
                const salesData = {
                    items: selectedCartItems.map(item => ({
                        inventoryId: item.inventoryId,
                        productName: item.productName,
                        quantity: item.quantity
                    })),
                    totalPrice: totalPrice,
                    created_at: new Date(),
                    updated_at: new Date()
                };
    
                // Send the sales data to the server for saving
                const salesResponse = await fetch('/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(salesData)
                });
    
                if (salesResponse.ok) {
                    // Proceed to remove selected items from the cart
                    const removeResponse = await fetch('/removeFromCart', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ items: selectedItems })
                    });
    
                    if (removeResponse.ok) {
                        // Refresh the cart items after successful removal
                        populateCartItems();
    
                        fetchInventoryData().then((data) => {
                            updateTableWithData(data);
                        });
                    } else {
                        console.error('Failed to remove cart items:', removeResponse.statusText);
                    }
                } else {
                    console.error('Failed to save sales data:', salesResponse.statusText);
                }
            } catch (error) {
                console.error('Error during checkout:', error);
            }
        });
    
        
    //********************************************************************************
    ////checkboxes event listener to display total price
    //********************************************************************************
        cartItemsElements.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox' && event.target.name === 'cartItem') {
                const checkedCheckboxes = cartItemsElements.querySelectorAll('input[name="cartItem"]:checked');
                let totalPrice = 0;
    
                checkedCheckboxes.forEach(checkbox => {
                    const itemDiv = checkbox.closest('.cartItemCard');
                    const totalPriceElement = itemDiv.querySelector('.total-price');
                    const totalPriceText = totalPriceElement.textContent;
    
                    // Extract the numeric value by removing "Total Price:" and trimming spaces
                    const numericValue = parseFloat(totalPriceText.replace(/[^0-9.-]+/g,""));
    
                    if (!isNaN(numericValue)) {
                        totalPrice += numericValue;
                    }
                });
    
                cartTotalPriceElement.innerHTML = `<p>Total Price: ${formatAsMoney(totalPrice)}</p>`;
            }
        });
    
    });
    
    