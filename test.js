async function handleCartButtonClick(cartButton) {
    quantityInputListener = false; // Reset the listener flag

    console.log(quantityInputListener);

    const table = new DataTable(inventoryTable);
    const rowData = table.row(cartButton.closest("tr")).data();
    console.log(rowData.quantity_inStock);

    cartModalContainer.style.display = "block";
    overlay.style.display = "block";

    if (rowData) {
        productNameDisplay.textContent = `Product Name: ${rowData.product_name}`;
        sellingPriceDisplay.textContent = `Total Value: ${formatAsPhCurrency(rowData.selling_price)}`;
        cartItemId.value = rowData._id;
        orderCost.value = rowData.selling_price;

        const quantityInput = document.getElementById(
            "quantity-input-element"
        );

        // Check if the event listener is already attached before adding it
        if (!quantityButtonsListener) {
            quantityInput.addEventListener("click", (event) => {
                const target = event.target.id;

                if (target === "increaseButton") {
                    if (parseInt(itemQuantity.value) < rowData.quantity_inStock) {
                        itemQuantity.value++;
                        // updateTotalValue();
                    }
                } 
                else if (target === "decreaseButton") {
                    if (parseInt(itemQuantity.value) > 1) {
                        itemQuantity.value--;
                        // updateTotalValue();
                    }
                }
            });
            quantityButtonsListener = true;
        }

        if (!quantityInputListener) {
            quantityInput.addEventListener("input", (event) => {
                console.log(rowData.quantity_inStock);
                const target = event.target.id;
                if (target === "itemQuantity") {
                    const inputQuantity = itemQuantity.value ? parseInt(itemQuantity.value) : itemQuantity.value;

                    if (inputQuantity > rowData.quantity_inStock) {
                        itemQuantity.value = rowData.quantity_inStock;
                        console.log(rowData.quantity_inStock);
                        updateTotalValue();
                    } else if (inputQuantity < 1) {
                        itemQuantity.value = 1;
                        updateTotalValue();
                    } else {
                        itemQuantity.value = inputQuantity;
                        updateTotalValue();
                    }
                }
            });
            quantityInputListener = true;
        }
    }

    function updateTotalValue() {
        totalPrice = calculateTotalValue(
            itemQuantity.value,
            orderCost.value
        );
        const formattedPrice = formatAsPhCurrency(totalPrice);
        sellingPriceDisplay.textContent = `Total Value: ${formattedPrice}`;
        cartTotalPrice = totalPrice;
    }
}