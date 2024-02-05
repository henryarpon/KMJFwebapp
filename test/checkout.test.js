import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index.js'; 
import Inventory from '../models/inventory.js';
import Sales from '../models/sales.js';

chai.use(chaiHttp);
const expect = chai.expect;

describe('checkout function', () => {
  // Test 1: Successful checkout
  it('should save sales data and update inventory successfully', async () => {
    const inventoryItem = new Inventory({
      product_name: 'Test Product',
      quantity_inStock: 10,
      reorder_point: 5,
      reorder_quantity: 10,
      send_email: true,
      supplier: 'Test Supplier',
      supplier_email: 'supplier@test.com',
    });
    await inventoryItem.save();

    const response = await chai
      .request(app)
      .post('/checkout')
      .send({
        items: [
          {
            productName: 'Test Product',
            quantity: 2,
            inventoryId: inventoryItem._id,
          },
        ],
        totalPrice: 20,
        created_at: new Date(),
        updated_at: new Date(),
      });

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Sales data saved and inventory updated successfully');

    // Check if inventory is updated
    const updatedInventoryItem = await Inventory.findById(inventoryItem._id);
    expect(updatedInventoryItem).to.have.property('quantity_inStock', 8);
  });

  // Test 2: Error case - Internal server error during checkout
  it('should handle internal server error during checkout', async () => {
    // Simulate an internal server error during checkout
    const response = await chai
      .request(app)
      .post('/checkout')
      .send({
        // Invalid data to trigger an error in your checkout function
      });

    expect(response).to.have.status(500);
    expect(response.body).to.have.property('error', 'Internal server error');
  });

  // Test 3: Error case - Inventory item not found
  it('should handle error when inventory item is not found', async () => {
    const response = await chai
      .request(app)
      .post('/checkout')
      .send({
        items: [
          {
            productName: 'Nonexistent Product',
            quantity: 2,
            inventoryId: 'nonexistent-id',
          },
        ],
        totalPrice: 20,
        created_at: new Date(),
        updated_at: new Date(),
      });

    expect(response).to.have.status(500);
    expect(response.body).to.have.property('error', 'Internal server error');
  });

  // Test 4: Error case - Inventory quantity goes negative
  it('should handle error when inventory quantity goes negative', async () => {
    const inventoryItem = new Inventory({
      product_name: 'Negative Quantity Product',
      quantity_inStock: 5,
      reorder_point: 5,
      reorder_quantity: 10,
      send_email: true,
      supplier: 'Test Supplier',
      supplier_email: 'supplier@test.com',
    });
    await inventoryItem.save();

    const response = await chai
      .request(app)
      .post('/checkout')
      .send({
        items: [
          {
            productName: 'Negative Quantity Product',
            quantity: 10,
            inventoryId: inventoryItem._id,
          },
        ],
        totalPrice: 100,
        created_at: new Date(),
        updated_at: new Date(),
      });

    expect(response).to.have.status(500);
    expect(response.body).to.have.property('error', 'Internal server error');

    // Check if inventory is not updated
    const unchangedInventoryItem = await Inventory.findById(inventoryItem._id);
    expect(unchangedInventoryItem).to.have.property('quantity_inStock', 5);
  });

  // Test 5: Successful checkout with inventory item deletion
  it('should save sales data, update inventory, and delete inventory item successfully', async () => {
    const inventoryItem = new Inventory({
      product_name: 'Deletion Product',
      quantity_inStock: 2,
      reorder_point: 5,
      reorder_quantity: 10,
      send_email: true,
      supplier: 'Test Supplier',
      supplier_email: 'supplier@test.com',
    });
    await inventoryItem.save();

    const response = await chai
      .request(app)
      .post('/checkout')
      .send({
        items: [
          {
            productName: 'Deletion Product',
            quantity: 2,
            inventoryId: inventoryItem._id,
          },
        ],
        totalPrice: 20,
        created_at: new Date(),
        updated_at: new Date(),
      });

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Sales data saved and inventory updated successfully');

    // Check if inventory item is deleted
    const deletedInventoryItem = await Inventory.findById(inventoryItem._id);
    expect(deletedInventoryItem).to.be.null;
  });
});
