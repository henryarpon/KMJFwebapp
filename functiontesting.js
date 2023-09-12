document.addEventListener('DOMContentLoaded', async () => {
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
        const documentInput = document.getElementById("documentNumber");
    
        //Global Variables
        const showEditColumn = userType !== 'basic-user';
        let productName = "";
        let sellingPrice = "";
        
    //********************************************************************************
    ////Functions Declarations
    //********************************************************************************
    
        // DOM Manipulation Function
        function closeModal(modal, overlay) {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }
    
        // DOM Manipulation Function
        function resetInputFields() {
            // Update input values
            product_name.value = "";
            received_quantity.value = "";
            cost_price.value = "";
            selling_price.value = "";
            supplier.value = ""; 
            reorderPoint.value = "";
            sku.value = "";
        
            // Enable the input fields
            sku.disabled = false;
            product_name.disabled = false;
            selling_price.disabled = false;
            supplier.disabled = false;
            reorderPoint.disabled = false;
    
            addInventoryFormGrid.style.display = 'grid';
            skuListContainer.style.display = 'none';
        }
    
        //Form Handling Function
        function extractFormData(form) {
        
            if(form === addInventoryForm){
                const formData = {
                    product_name: form.querySelector('#product_name').value,
                    received_quantity: form.querySelector('#received_quantity').value,
                    cost_price: form.querySelector('#cost_price').value,
                    selling_price: form.querySelector('#selling_price').value,
                    supplier: form.querySelector('#supplier').value,
                    sku: form.querySelector('#sku').value,
                    reorderPoint: form.querySelector('#reorderPoint').value, 
                    documentNumber: form.querySelector('#documentNumber').value
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
    
        //Data Management Function
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
        
        //Data Management Function
        async function fetchData() {
            try {
                const data = await fetchInventoryData();
    
                // Define the columns array based on the showEditColumn flag
                const columns = [
                    { data: 'sku' },
                    { data: 'product_name' },
                    { data: 'documentNumber'},
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
                    columns.splice(9, 0, { data: 'Edit' });
                }
    
                $('#myTable').DataTable({
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
            $('#myTable').DataTable().clear().rows.add(data).draw();
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
            let endpoint = '';
        
            if (param.paramType === 'sku') {
                endpoint = `/getInventoryBySKU/${param.skuItem}`;
            } 
            else if (param.paramType === 'itemId') {
                endpoint = `/getInventoryItem/${param.itemId}`;
            } 
            else {
                return null; // Invalid paramType
            }
        
            try {
                const response = await fetch(endpoint);
        
                if (!response.ok) {
                    throw new Error('Failed to fetch inventory item');
                }
        
                return await response.json();
            } 
            catch (error) {
                console.error('Error fetching inventory item:', error);
                return null;
            }
        }
        
    //********************************************************************************
    ////Display add Inventory form
    //********************************************************************************
    
        showAddInventoryModal.addEventListener('click', () => {
            modalContainerElement.style.display = 'block';
            overlayElement.style.display = 'block';
        });
    
    //********************************************************************************
    ////Add Inventory Form Event Listener 
    //********************************************************************************
        addInventoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = extractFormData(addInventoryForm); 
    
            try {
                const response = await fetch('/addInventory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
    
                initTable();
                resetInputFields();
            } 
            catch (error) {
                console.error('Error:', error);
            }
    
            addInventoryForm.reset();
        });
    //********************************************************************************
    ////SKU Event Listener
    //********************************************************************************
       
        sku.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                handleSkuValidation();
            }
        });
    
        sku.addEventListener('blur', async (event) => {
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
                paramType: 'sku',
            };
    
            const response = await fetchInventoryItem(itemObject);
    
            if (response.length > 1) {
                sku.disabled = true;
                addInventoryFormGrid.style.display = 'none';
                skuListContainer.style.display = 'block';
    
                while (skuListContainer.firstChild) {
                    skuListContainer.removeChild(skuListContainer.firstChild);
                }
    
                productName = response[0].product_name;
                sellingPrice = response[0].selling_price;
    
                response.forEach((item) => {
                    const card = document.createElement('div');
                    card.classList.add('sku-card');
    
                    const documentNumberElement = document.createElement('p');
                    const documentNumberStrong = document.createElement('strong');
                    documentNumberStrong.textContent = 'Document Number:';
                    const documentNumberSpan = document.createElement('span');
                    documentNumberSpan.textContent = item.documentNumber;
                    documentNumberElement.appendChild(documentNumberStrong);
                    documentNumberElement.appendChild(documentNumberSpan);
    
                    const itemQuantity = document.createElement('p');
                    const itemQuantityStrong = document.createElement('strong');
                    itemQuantityStrong.textContent = 'Quantity in stock:';
                    const itemQuantitySpan = document.createElement('span');
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
                    reorderPoint.disabled = true;
                });
            } else if (response.length === 1) {
                product_name.value = response[0].product_name;
                received_quantity.value = response[0].quantity_received;
                cost_price.value = response[0].cost_price;
                selling_price.value = response[0].selling_price;
                supplier.value = response[0].supplier;
                reorderPoint.value = response[0].reorderPoint;
    
                // Disable the input fields
                sku.disabled = true;
                product_name.disabled = true;
                received_quantity.disabled = true;
                selling_price.disabled = true;
                cost_price.disabled = true;
                supplier.disabled = true;
                reorderPoint.disabled = true;
            } else if (response.error) {
                console.log("No items returned");
            }
        }
    
        documentInput.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                const docInput = document.getElementById("documentNumber").value;
                event.preventDefault();
        
                try {
                    const response = await fetch(`getInventoryByDoc/${docInput}`);
        
                    if (!response.ok) {
                        throw new Error('Failed to fetch inventory by document Number');
                    }
        
                    const data = await response.json();
    
                    if(data.length > 0) {
                       alert('Document number already exist');
                    }
                    else {
                        addInventoryFormGrid.style.display = 'grid';
                        skuListContainer.style.display = 'none';
    
                        product_name.value = productName;
                        received_quantity.disabled = false;
                        selling_price.value = sellingPrice;
                        cost_price.disabled = false;
                        supplier.disabled = false;
                        reorderPoint.disabled = false;
                    }
    
                } catch (error) {
                    // Handle the error here
                    console.error('An error occurred:', error);
                }
            }
        });
        
    //********************************************************************************
    ////Close Modal - this close all pop-up modal 
    //********************************************************************************
    
        // modalContainerCloseButton.addEventListener('click', () => closeModal(modalContainer, overlay));
        modalContainerCloseButton.addEventListener('click', () => {
            closeModal(modalContainer, overlay);
            resetInputFields();
        });
        
    //********************************************************************************
    ////Auto dispatch events - events that should happen when page loads
    //********************************************************************************
    
        fetchData();
        
    //********************************************************************************
    ////End
    //********************************************************************************
    });