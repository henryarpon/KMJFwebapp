document.addEventListener('DOMContentLoaded', () => {
    
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
    const deleteButton = document.querySelector('#deleteButton');
 
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
    function closeModal(modal, overlay) {
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
    }

//********************************************************************************
////Event listener for close buttons 
//********************************************************************************
    addFormCloseButton.addEventListener('click', () => closeModal(modalContainer, overlay));
    editFormCloseButton.addEventListener('click', () => closeModal(editModalContainer, overlay));
    cartFormCloseButton.addEventListener('click', () => closeModal(cartModalContainer, overlay));

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
        console.log("Fetched data:", data);

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
        const editButton = event.target.closest('#editButton');
        const cartButton = event.target.closest('#cartButton');

        if (editButton) {
            const table = $('#myTable').DataTable();
            const rowData = table.row(editButton.closest('tr')).data();
            const itemId = rowData._id;

            editModalContainer.style.display = 'block';
            overlay.style.display = 'block';

            try {
                const response = await fetch(`/getInventoryItem/${itemId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch inventory item');
                }

                const inventoryItem = await response.json();

                console.log(inventoryItem);

                editProductNameInput.value = inventoryItem.product_name;
                editReceivedQuantityInput.value = inventoryItem.quantity_received;
                editQuantityInStockInput.value = inventoryItem.quantity_inStock;
                editCostPriceInput.value = inventoryItem.cost_price;
                editSellingPriceInput.value = inventoryItem.selling_price;
                editSupplierInput.value = inventoryItem.supplier;
                editSKUInput.value = inventoryItem.sku;
                editDescriptionInput.value = inventoryItem.description;
                editFormItemIdInput.value = itemId;

            } 
            catch (error) {
                console.error('Error fetching inventory item:', error);
            }
        }

        if(cartButton) {

            const table = $('#myTable').DataTable();
            const rowData = table.row(cartButton.closest('tr')).data();
            const itemId = rowData._id;

            try {
                const response = await fetch(`/getInventoryItem/${itemId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch inventory item');
                }

                const inventoryItem = await response.json();

                console.log(inventoryItem);

                // Display the product name in the HTML form
                const productNameElement = document.getElementById('productName');
                productNameElement.textContent = `Product Name: ${inventoryItem.product_name}`;

                cartItemId.value = itemId;

                cartModalContainer.style.display = 'block';
                overlay.style.display = 'block';

            } 
            catch (error) {
                console.error('Error fetching inventory item:', error);
            }
        }
    });

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

            closeModal(editModalContainer, overlay);

            fetchInventoryData().then((data) => {
                updateTableWithData(data);
            });

        } catch (error) {
            console.error('Error deleting inventory item:', error);
        }

    })
//********************************************************************************
////Add to cart event listener
//********************************************************************************

});
