import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index.js'; // Import your Express app
import Inventory from '../models/inventory.js'; // Make sure to use the correct path

chai.use(chaiHttp);
const expect = chai.expect;

describe('addInventory function', () => {
  // Test 1: Successful inventory addition
  it('should add a new inventory item', async () => {
    const response = await chai
      .request(app)
      .post('/addInventory')
      .send({
        sku: 'ABC123',
        product_name: 'test product',
        received_quantity: 10,
        cost_price: 5,
        selling_price: 10,
        supplier: 'test supplier',
        supplier_email: 'supplier@test.com',
        reorder_point: 5,
        reorder_quantity: 10,
        document_number: 'DOC001',
        sendEmail: true,
      });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('inventory');
    expect(response.body.inventory).to.have.property('sku', 'ABC123');
  });

  // Test 2: Missing required fields
  it('should return an error if required fields are missing', async () => {
    const response = await chai
      .request(app)
      .post('/addInventory')
      .send({
        // Omitting required fields intentionally
      });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('error', 'All fields are required.');
  });

  // Test 3: Negative quantity and price values
  it('should return an error for negative quantity and price values', async () => {
    const response = await chai
      .request(app)
      .post('/addInventory')
      .send({
        sku: 'ABC123',
        product_name: 'test product',
        received_quantity: -5,
        cost_price: -2,
        selling_price: -1,
        supplier: 'test supplier',
        supplier_email: 'supplier@test.com',
        reorder_point: 5,
        reorder_quantity: 10,
        document_number: 'DOC001',
        sendEmail: true,
      });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property(
      'error',
      'Received quantity, cost price, and selling price must be greater than or equal to 0.'
    );
  });

  // Test 4: Capitalization of SKU and Supplier Name
  it('should capitalize SKU and Supplier Name', async () => {
    const response = await chai
      .request(app)
      .post('/addInventory')
      .send({
        sku: 'abc123',
        product_name: 'test product',
        received_quantity: 10,
        cost_price: 5,
        selling_price: 10,
        supplier: 'test supplier',
        supplier_email: 'supplier@test.com',
        reorder_point: 5,
        reorder_quantity: 10,
        document_number: 'DOC001',
        sendEmail: true,
      });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('inventory');
    expect(response.body.inventory).to.have.property('sku', 'ABC123');
    expect(response.body.inventory).to.have.property('supplier', 'Test Supplier');
  });

  // Test 5: Default value for send_email when not provided
  it('should set send_email to true if not provided', async () => {
    const response = await chai
      .request(app)
      .post('/addInventory')
      .send({
        sku: 'ABC123',
        product_name: 'test product',
        received_quantity: 10,
        cost_price: 5,
        selling_price: 10,
        supplier: 'test supplier',
        supplier_email: 'supplier@test.com',
        reorder_point: 5,
        reorder_quantity: 10,
        document_number: 'DOC001',
        // sendEmail is intentionally omitted
      });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('inventory');
    expect(response.body.inventory).to.have.property('send_email', true);
  });
});
