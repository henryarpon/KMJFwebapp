document.addEventListener("DOMContentLoaded", async () => {
//********************************************************************************
////Variables Declartions
//********************************************************************************
    //DOM Elements variables
    const showAddInventoryModal = document.getElementById("addInventoryFormButton");
    const overlayElement = document.getElementById("overlay");
    const modalContainerElement = document.getElementById("modalContainer");
    const modalContainerCloseButton = document.getElementById("modal-close-button");
    const addInventoryForm = document.getElementById("addInventoryForm");
    const sku = document.getElementById("sku");
    const addInventoryFormGrid = document.getElementById("addInventoryForm-grid");
    const skuListContainer = document.getElementById("sku-list");
    const documentInput = document.getElementById("document_number");
    const inventoryTable = document.getElementById("inventoryTable");
    const editModalContainer = document.querySelector("#editModalContainer");
    const editFormCloseButton = document.querySelector("#editForm-closeButton");
    const editInventoryForm = document.querySelector("#editInventoryForm");
    const editFormDeleteButton = document.querySelector("#deleteButton");
    const cartModalContainer = document.querySelector("#cartModalContainer");
    const cartForm = document.querySelector("#cartForm");
    const cartItemId = document.getElementById("cartItemId");
    const cartFormQuantityInput = document.getElementById("quantity-input-element");
    const cartFormCloseButton = document.querySelector("#cartForm-closeButton");
    const cartItemsElements = document.querySelector("#cartItems");
    const cartTotalPriceElement = document.querySelector("#cartTotalPrice");
    const removeButtonPOS = document.getElementById("pos-remove-button");
    const checkoutButtonPOS = document.getElementById("pos-checkout-button");

    //Global Variables
    //used inside the fetch data function
    const showEditColumn = userType !== "basic-user";

    //used inside sku event listener
    let productName = "";
    let sellingPrice = "";
    let itemPrice = 0;
    let cartFormSellingPrice = null;
    let cartFormQuantityInStock = null;
    let quantityButtonsListener = false;
    let quantityInputListener = false;

//********************************************************************************
////Functions Declarations
//********************************************************************************
    // DOM Manipulation Function
    function closeModal(modal, overlay) {
        modal.style.display = "none";
        overlay.style.display = "none";
    }

    // DOM Manipulation Function
    function resetInputFields() {
        const inputFields = [
            product_name,
            received_quantity,
            cost_price,
            selling_price,
            supplier,
            reorder_point,
            sku,
            document_number,
            supplier_email,
            reorder_quantity
        ];

        inputFields.forEach((field) => (field.value = ""));
        inputFields.forEach((field) => (field.disabled = false));

        addInventoryFormGrid.style.display = "grid";
        skuListContainer.style.display = "none";
    }

    //Form Handling Function
    function extractFormData(form) {
        if (form === addInventoryForm) {
            const formData = {
                sku: form.querySelector("#sku").value,
                product_name: form.querySelector("#product_name").value,
                received_quantity: form.querySelector("#received_quantity").value,
                cost_price: form.querySelector("#cost_price").value,
                selling_price: form.querySelector("#selling_price").value,
                supplier: form.querySelector("#supplier").value,
                supplier_email: form.querySelector("#supplier_email").value,
                reorder_point: form.querySelector("#reorder_point").value,
                reorder_quantity: form.querySelector("#reorder_quantity").value,
                document_number: form.querySelector("#document_number").value,
            };

            return formData;
        } 
        else if (form === editInventoryForm) {

            const formData = {
                sku: editSKU.value,
                product_name: editProductName.value,
                received_quantity: editReceivedQuantity.value,
                quantity_inStock: editQuantityInStock.value,
                cost_price: editCostPrice.value,
                selling_price: editSellingPrice.value,
                supplier: editSupplier.value,
                supplier_email: editSupplierEmail.value, 
                reorder_point: editReorderPoint.value,
                reorder_quantity: editReorderQuantity.value,
                document_number: editDocumentNumber.value,
                itemId: editFormItemId.value,
            };

            return formData;
        }
    }

    async function fetchInventoryData() {
        try {
            const response = await fetch("/getInventoryData");
    
            if (!response.ok) {
                throw new Error("Failed to fetch inventory data");
            }
    
            const data = await response.json();

            data.forEach((item) => {
                item["Edit"] = '<button id="editButton" class="tableButton">Edit</button>';
                item["Add to Cart"] = '<button id="cartButton" class="tableButton">Add to Cart</button>';
                
                // Generate the checkbox HTML
                const isChecked = item.send_email === true;
                item["Send Email"] = 
                        `<input type="checkbox" id="emailSender" ${isChecked ? 'checked' : ''}>`;
            });
    
            return data;
        } catch (error) {
            console.error("Error fetching inventory data:", error);
            return [];
        }
    }
    

    async function fetchData() {
        try {
            const data = await fetchInventoryData();

            // Define the columns array
            const columns = [
                { data: "sku" },
                { data: "product_name" },
                { data: "document_number" },
                { data: "quantity_received" },
                { data: "quantity_inStock" },
                {
                    data: "cost_price",
                    render: function (data, type, row) {
                        if (type === "display" || type === "filter") {
                            return formatAsPhCurrency(data);
                        }
                        return data; 
                    },
                },
                {
                    data: "selling_price",
                    render: function (data, type, row) {
                        if (type === "display" || type === "filter") {
                            return formatAsPhCurrency(data);
                        }
                        return data; 
                    },
                },
                { data: "updated_at" }, 
                { data: "Send Email" },
                { data: "Add to Cart" },
            ];
    
            // Conditionally add the "Edit" column to the columns array
            if (showEditColumn) {
                columns.splice(9, 0, { data: "Edit" });
            }
    
            const dataTable = new DataTable(inventoryTable, {
                data: data,
                columns: columns,
            });       
        } 
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    
    //Data Management Function
    function updateTableWithData(data) {
        const dataTable = new DataTable(inventoryTable);

        dataTable.clear().rows.add(data).draw();
    }

    //Data Management Function
    async function initTable() {
        try {
            const data = await fetchInventoryData();
            updateTableWithData(data);
        } catch (error) {
            console.error("Error initializing table:", error);
        }
    }

    //Data Management Function
    async function fetchInventoryItem(param) {
        let endpoint = "";

        if (param.paramType === "sku") {
            endpoint = `/getInventoryBySKU/${param.skuItem}`;
        } else if (param.paramType === "itemId") {
            endpoint = `/getInventoryByItemId/${param.itemId}`;
        } else {
            return null; // Invalid paramType
        }

        try {
            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error("Failed to fetch inventory item");
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching inventory item:", error);
            return null;
        }
    }

    //Data Management Function
    async function populateCartItems() {
        try {
            const response = await fetch("/getCartItems");
            const cartItems = await response.json();

            cartItemsElements.innerHTML = "";

            cartItems.forEach((item) => {
                const label = document.createElement("label");

                const itemDiv = document.createElement("div");
                itemDiv.classList.add("cartItemCard");

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `cartItem_${item.itemId}`;
                checkbox.name = "cartItem";
                checkbox.value = item.itemId;

                const quantity = document.createElement("span");
                quantity.innerText = `${item.quantity}x`;

                const productName = document.createElement("p");
                productName.innerHTML = `${quantity.outerHTML} ${item.productName}`;

                const totalPrice = document.createElement("p");
                totalPrice.classList.add("total-price");
                totalPrice.innerHTML = `<strong>Total Price:</strong> ${formatAsPhCurrency(
                    item.totalPrice
                )}`;

                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(productName);
                itemDiv.appendChild(totalPrice);

                label.htmlFor = `cartItem_${item.itemId}`;
                label.appendChild(itemDiv);

                cartItemsElements.appendChild(label);
            });

            if (
                cartItemsElements.querySelectorAll(
                    'input[name="cartItem"]:checked'
                ).length === 0
            ) {
                cartTotalPriceElement.innerHTML = `<p>Total Price: ${formatAsPhCurrency(
                    0
                )}</p>`;
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    }

//********************************************************************************
////Inventory Table Utility Functions
//********************************************************************************
    //Data Management Function -- for edit button
    async function handleEditButtonClick(editButton) {
        const table = new DataTable(inventoryTable);
        const rowData = table.row(editButton.closest("tr")).data();
        const itemId = rowData._id;

        editModalContainer.style.display = "block";
        overlay.style.display = "block";

        const itemObject = {
            itemId: itemId,
            paramType: "itemId",
        };

        const inventoryItem = await fetchInventoryItem(itemObject);

        if (inventoryItem) {
            editSKU.value = inventoryItem.sku;
            editProductName.value = inventoryItem.product_name;
            editReceivedQuantity.value = inventoryItem.quantity_received;
            editQuantityInStock.value = inventoryItem.quantity_inStock;
            editCostPrice.value = inventoryItem.cost_price;
            editSellingPrice.value = inventoryItem.selling_price;
            editSupplier.value = inventoryItem.supplier;
            editSupplierEmail.value = inventoryItem.supplier_email;
            editReorderPoint.value = inventoryItem.reorder_point;
            editReorderQuantity.value = inventoryItem.reorder_quantity;
            editDocumentNumber.value = inventoryItem.document_number;
            editFormItemId.value = inventoryItem._id;
        }
    }

    //Data Management Function
    function calculateTotalValue(currentQuantity, sellingPrice) {
        return currentQuantity * sellingPrice;
    }

    //Data Management Function
    function formatAsPhCurrency(amount) {
        const formatter = new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        });
        return formatter.format(amount);
    }

    // DOM Manipulation Function
    function updateTotalValue(itemQuantity, sellingPrice) {

        totalPrice = calculateTotalValue(itemQuantity,sellingPrice);
        const formattedPrice = formatAsPhCurrency(totalPrice);
        sellingPriceDisplay.textContent = `Total Value: ${formattedPrice}`;
        cartFormSellingPrice = totalPrice;
    }

    // DOM Manipulation Function
    function quantityButtons(event) {

        const target = event.target.id;
        if (target === "increaseButton") {
            if (parseInt(itemQuantity.value) < cartFormQuantityInStock) {
                itemQuantity.value++;
                updateTotalValue(itemQuantity.value, itemPrice);
            }
        } 
        else if (target === "decreaseButton") {
            if (parseInt(itemQuantity.value) > 1) {
                itemQuantity.value--;
                updateTotalValue(itemQuantity.value, itemPrice);
            }
        }
    }

    // DOM Manipulation Function
    function quantityInput(event) {

        const target = event.target.id;
        if(target === "itemQuantity") {
            const inputQuantity = parseInt(itemQuantity.value) || itemQuantity.value;

            if(inputQuantity > cartFormQuantityInStock) {
                itemQuantity.value = cartFormQuantityInStock; 
                updateTotalValue(itemQuantity.value, itemPrice);
            }
            else {
                itemQuantity.value = inputQuantity;
                updateTotalValue(itemQuantity.value, itemPrice);
            }
        };
    }

    //Data Management Function -- for cart button
    async function handleCartButtonClick(cartButton) {

        const table = new DataTable(inventoryTable);
        const rowData = table.row(cartButton.closest("tr")).data();

        console.log(rowData);

        cartItemId.value = rowData._id;
        cartFormQuantityInStock = rowData.quantity_inStock;
        cartFormSellingPrice = rowData.selling_price;
        itemPrice = rowData.selling_price;

        cartModalContainer.style.display = "block";
        overlay.style.display = "block";

       
        if(rowData) {
            productNameDisplay.textContent = `Product Name: ${rowData.product_name}`;
            sellingPriceDisplay.textContent = `Total Value: ${formatAsPhCurrency(rowData.selling_price)}`;
            
            if(quantityButtonsListener === false) {
                cartFormQuantityInput.addEventListener("click", quantityButtons);
                quantityButtonsListener = true;
            }
            if(quantityInputListener === false) {
                cartFormQuantityInput.addEventListener("input", quantityInput); 
                quantityInputListener = true;
            } 
        }
    };
    
    async function handleEmailSender(checkbox) {
        const table = new DataTable(inventoryTable);
        const rowData = table.row(checkbox.closest("tr")).data();
    
        try {
            const response = await fetch("/updateSendEmail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: rowData._id,
                    send_email: checkbox.checked
                }),
            });
    
            if (!response.ok) {
                console.log("Failed to update send_email property");
            }
    
            // Handle the response or update the UI as needed
        } catch (error) {
            console.error("Error updating send_email property:", error);
        }
    }
    
//********************************************************************************
////Display add Inventory form
//********************************************************************************
    showAddInventoryModal.addEventListener("click", () => {
        modalContainerElement.style.display = "block";
        overlayElement.style.display = "block";
    });

//********************************************************************************
////Add Inventory Form Event Listener
//********************************************************************************
    addInventoryForm.addEventListener("submit", async (event) => {

        event.preventDefault();
        const formData = extractFormData(addInventoryForm);

        try {
            const response = await fetch("/addInventory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            initTable();
            resetInputFields();
        } 
        catch (error) {
            console.error("Error:", error);
        }

        addInventoryForm.reset();
    });
//********************************************************************************
////SKU Look-up Event Listener
//********************************************************************************
    sku.addEventListener("keydown", async (event) => {
        if (event.key === "Enter") {
            handleSkuValidation();
        }
    });

    sku.addEventListener("blur", async (event) => {
        // Check if the blur event was caused by a mouse click or Tab key press
        const activeElement = document.activeElement;
        if (activeElement !== sku || event.relatedTarget !== null) {
            handleSkuValidation();
        }
    });

    async function handleSkuValidation() {
        // Handle SKU validation here
        const itemObject = {
            skuItem: sku.value,
            paramType: "sku",
        };

        const response = await fetchInventoryItem(itemObject);

        if (response.length > 1) {
            sku.disabled = true;
            addInventoryFormGrid.style.display = "none";
            skuListContainer.style.display = "block";
            productName = response[0].product_name;
            sellingPrice = response[0].selling_price;

            while (skuListContainer.firstChild) {
                skuListContainer.removeChild(skuListContainer.firstChild);
            }

            response.forEach((item) => {
                const card = document.createElement("div");
                card.classList.add("sku-card");

                const documentNumberElement = document.createElement("p");
                const documentNumberStrong = document.createElement("strong");
                documentNumberStrong.textContent = "Document Number:";
                const documentNumberSpan = document.createElement("span");
                documentNumberSpan.textContent = item.document_number;
                documentNumberElement.appendChild(documentNumberStrong);
                documentNumberElement.appendChild(documentNumberSpan);

                const itemQuantity = document.createElement("p");
                const itemQuantityStrong = document.createElement("strong");
                itemQuantityStrong.textContent = "Quantity in stock:";
                const itemQuantitySpan = document.createElement("span");
                itemQuantitySpan.textContent = item.quantity_inStock;
                itemQuantity.appendChild(itemQuantityStrong);
                itemQuantity.appendChild(itemQuantitySpan);

                card.appendChild(documentNumberElement);
                card.appendChild(itemQuantity);

                skuListContainer.appendChild(card);

                // Disable the input fields
                sku.disabled = true;
                product_name.disabled = true;
                received_quantity.disabled = true;
                selling_price.disabled = true;
                cost_price.disabled = true;
                supplier.disabled = true;
                reorder_point.disabled = true;
            });
        } else if (response.length === 1) {

            productName = response[0].product_name;
            sellingPrice = response[0].selling_price;

            product_name.value = response[0].product_name;
            received_quantity.value = response[0].quantity_received;
            cost_price.value = response[0].cost_price;
            selling_price.value = response[0].selling_price;
            supplier.value = response[0].supplier;
            reorder_point.value = response[0].reorder_point;
            supplier_email.value = response[0].supplier_email;
            reorder_quantity.value = response[0].reorder_quantity;

            // Disable the input fields
            sku.disabled = true;
            product_name.disabled = true;
            received_quantity.disabled = true;
            selling_price.disabled = true;
            cost_price.disabled = true;
            supplier.disabled = true;
            reorder_point.disabled = true;
            supplier_email.disabled = true; 
            reorder_quantity.disabled = true;
        } 
        else if (response.error) {
            console.log("No items returned");
        }
    }
//********************************************************************************
////Document Number Look-up Event Listener
//********************************************************************************
    documentInput.addEventListener("keydown", async (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            
            const docInput = document.getElementById("document_number").value;

            try {
                const response = await fetch(`getInventoryByDoc/${docInput}`);

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch inventory by document Number"
                    );
                }

                const data = await response.json();

                if (data.length > 0) {
                    alert("Document number already exist");
                } else {
                    addInventoryFormGrid.style.display = "grid";
                    skuListContainer.style.display = "none";

                    product_name.value = productName ? productName : product_name.value;
                    received_quantity.disabled = false;
                    selling_price.value = sellingPrice ? sellingPrice : selling_price.value;
                    cost_price.disabled = false;
                    supplier.disabled = false;
                    supplier_email.disabled = false; 
                    reorder_point.disabled = false;
                    reorder_quantity.disabled = false;
                }
            } catch (error) {
                // Handle the error here
                console.error("An error occurred:", error);
            }
        }
    });

//********************************************************************************
////Close Modal - event listener for closing the add inventory form
//********************************************************************************
    modalContainerCloseButton.addEventListener("click", () => {
        closeModal(modalContainer, overlay);
        resetInputFields();
    });

    editFormCloseButton.addEventListener("click", () =>
        closeModal(editModalContainer, overlay)
    );
    cartFormCloseButton.addEventListener("click", () => {
        closeModal(cartModalContainer, overlay);
        itemQuantity.value = 1;
    });

//********************************************************************************
////Table Buttons event lister
//********************************************************************************
    inventoryTable.addEventListener("click", async (event) => {
        const targetId = event.target.id;

        if (targetId === "editButton") {
            await handleEditButtonClick(event.target);
        } 
        else if (targetId === "cartButton") {
            await handleCartButtonClick(event.target);
        } 
        else if(targetId === "emailSender") {
            await handleEmailSender(event.target);
        }
    });

//********************************************************************************
////Edit inventory form submission
//********************************************************************************
    editInventoryForm.addEventListener("submit", async (event) => {

        event.preventDefault();
        const formData = extractFormData(editInventoryForm);

        try {
            const response = await fetch("/editInventoryItem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            closeModal(editModalContainer, overlay);

            fetchInventoryData().then((data) => {
                updateTableWithData(data);
            });
        } catch (error) {
            console.error("Error:", error);
        }
    });

//********************************************************************************
////Edit Form Delete Event
//********************************************************************************
    editFormDeleteButton.addEventListener("click", async (event) => {
        //fetch the item id here
        const itemId = editFormItemId.value;

        try {
            const response = await fetch(`/deleteInventoryItem/${itemId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete inventory item");
            }
            populateCartItems();
            closeModal(editModalContainer, overlay);

            fetchInventoryData().then((data) => {
                updateTableWithData(data);
            });
        } catch (error) {
            console.error("Error deleting inventory item:", error);
        }
    });

//********************************************************************************
////Cart Form submission
//********************************************************************************
    cartForm.addEventListener("submit", async (event) => {

        event.preventDefault();
        

        const formData = {
            itemId: cartItemId.value,
            itemQuantity: itemQuantity.value,
            totalPrice: cartFormSellingPrice,
            quantityInStock: cartFormQuantityInStock
        };

        try {
            const response = await fetch("/addToCart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if(data.error) {
                alert(data.error);
            }

            populateCartItems();
            closeModal(cartModalContainer, overlay);
            itemQuantity.value = 1;
        } 
        catch (error) {
            console.error("Error:", error);
        }
    });

//********************************************************************************
////Cart POS Event listener
//********************************************************************************
    cartItemsElements.addEventListener("change", function (event) {
        if (event.target.type === "checkbox" && event.target.name === "cartItem") {

            const checkedCheckboxes = cartItemsElements.querySelectorAll(
                'input[name="cartItem"]:checked'
            );
            let totalPrice = 0;

            checkedCheckboxes.forEach((checkbox) => {
                const itemDiv = checkbox.closest(".cartItemCard");
                const totalPriceElement = itemDiv.querySelector(".total-price");
                const totalPriceText = totalPriceElement.textContent;

                // Extract the numeric value by removing "Total Price:" and trimming spaces
                const numericValue = parseFloat(
                    totalPriceText.replace(/[^0-9.-]+/g, "")
                );

                if (!isNaN(numericValue)) {
                    totalPrice += numericValue;
                }
            });

            cartTotalPriceElement.innerHTML = `<p>Total Price: ${formatAsPhCurrency(
                totalPrice
            )}</p>`;
        }
    });

//********************************************************************************
////Remove items from Cart/POS
//********************************************************************************
    removeButtonPOS.addEventListener("click", async () => {
        // Find all the checked checkboxes with the name "cartItem"
        const checkboxElements = cartItemsElements.querySelectorAll(
            'input[name="cartItem"]:checked'
        );

        // Extract the values of the selected items
        const selectedItems = Array.from(checkboxElements).map(
            (checkbox) => checkbox.value
        );

        if (selectedItems.length === 0) {
            alert("Please select items to remove from the cart.");
            return;
        }

        try {
            const response = await fetch("/removeFromCart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ items: selectedItems }),
            });

            if (response.ok) {
                // Refresh the cart items after successful removal
                populateCartItems();
            } else {
                console.error(
                    "Failed to remove cart items:",
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Error removing cart items:", error);
        }
    });

//********************************************************************************
////Check-out items from cart/POS
//********************************************************************************
    checkoutButtonPOS.addEventListener("click", async (event) => {
        try {
            // Find all the checked checkboxes with the name "cartItem"
            const checkboxElements = cartItemsElements.querySelectorAll(
                'input[name="cartItem"]:checked'
            );

            // Extract the values of the selected items
            const selectedItems = Array.from(checkboxElements).map(
                (checkbox) => checkbox.value
            );

            if (selectedItems.length === 0) {
                alert("Please select items to checkout.");
                return;
            }

            // Fetch selected cart items from the server
            const response = await fetch("/getCartItems");
            const cartItems = await response.json();

            // Filter selected cart items based on selectedItems array
            const selectedCartItems = cartItems.filter((item) =>
                selectedItems.includes(item.itemId)
            );

            // Calculate total price for the selected items
            const totalPrice = selectedCartItems.reduce(
                (total, item) => total + item.totalPrice,
                0
            );

            // Create a new sales document
            const salesData = {
                items: selectedCartItems.map((item) => ({
                    inventoryId: item.inventoryId,
                    productName: item.productName,
                    quantity: item.quantity,
                })),
                totalPrice: totalPrice,
                created_at: new Date(),
                updated_at: new Date(),
            };

            // Send the sales data to the server for saving
            const salesResponse = await fetch("/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(salesData),
            });

            if (salesResponse.ok) {
                // Proceed to remove selected items from the cart
                const removeResponse = await fetch("/removeFromCart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ items: selectedItems }),
                });

                if (removeResponse.ok) {
                    // Refresh the cart items after successful removal
                    populateCartItems();

                    fetchInventoryData().then((data) => {
                        updateTableWithData(data);
                    });
                } else {
                    console.error(
                        "Failed to remove cart items:",
                        removeResponse.statusText
                    );
                }
            } else {
                console.error(
                    "Failed to save sales data:",
                    salesResponse.statusText
                );
            }
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    });

//********************************************************************************
////Auto dispatch events - events that should happen when page loads
//********************************************************************************
    fetchData();
    populateCartItems();

//********************************************************************************
////End
//********************************************************************************
});
