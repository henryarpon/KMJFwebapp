async function handleCartButtonClick(cartButton) {
    const table = $('#myTable').DataTable();
    const rowData = table.row(cartButton.closest('tr')).data();
    const itemId = rowData._id;
    orderCost.value = rowData.selling_price;
    
    const inventoryItem = await fetchData(itemId);

    if (inventoryItem) {
        
        // Display the product name in the HTML form
        console.log(inventoryItem);
        const productNameElement = document.querySelector('#productName');
        cartItemId.value = itemId;
        let itemQuantity = itemQuantityInput.value;

        productNameElement.textContent = `Product Name: ${inventoryItem.product_name}`;
        sellingPriceDisplay.textContent = `Total Value: Php ${inventoryItem.selling_price}`;

        itemQuantityInput.addEventListener('input', () => {
            const enteredQuantity = parseInt(itemQuantityInput.value);
            
            if (enteredQuantity > inventoryItem.quantity_inStock) {
                // If entered quantity is greater than available stock
                itemQuantityInput.value = inventoryItem.quantity_inStock; // Set input value to max stock
            } else if (enteredQuantity < 1) {
                // If entered quantity is less than 1
                itemQuantityInput.value = 1; // Set input value to minimum 1
            } else {
                // Valid quantity entered
                itemQuantity = enteredQuantity;
            }
        
            // Update total value and other relevant displays
            totalPrice = calculateTotalValue(itemQuantity, inventoryItem.selling_price);
            sellingPriceDisplay.textContent = `Total Value: Php ${totalPrice}`;
            orderCost.value = totalPrice;
        });

        decreaseButton.addEventListener('click', () => {

            if (itemQuantity > 1) {
                itemQuantity--;
                itemQuantityInput.value = itemQuantity;
                totalPrice = calculateTotalValue(itemQuantityInput.value, inventoryItem.selling_price);
                sellingPriceDisplay.textContent = `Total Value: Php ${totalPrice}`;
                orderCost.value = totalPrice;
            }
        });

        increaseButton.addEventListener('click', () => {

            if (itemQuantity < inventoryItem.quantity_inStock) {
                itemQuantity++;
                itemQuantityInput.value = itemQuantity;
                totalPrice = calculateTotalValue(itemQuantityInput.value, inventoryItem.selling_price);
                sellingPriceDisplay.textContent = `Total Value: Php ${totalPrice}`;
                orderCost.value = totalPrice;
            }
        });

        
        
        cartModalContainer.style.display = 'block';
        overlay.style.display = 'block';
    };
};