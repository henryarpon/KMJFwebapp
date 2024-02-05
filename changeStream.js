import Inventory from "./models/inventory.js";

let changeStream; 

export function startChangeStream() {
  const pipeline = [
    {
      $match: {
        $or: [
          { 'updateDescription.updatedFields.quantity_inStock': { $exists: true } }
        ]
      },
    },
  ];

  changeStream = Inventory.watch(pipeline);

  changeStream.on("change", (change) => {
    console.log(change);

    // Check for a specific condition to close the change stream
    // if (/* Your condition here */) {
    //   stopChangeStream();
    // }
  });

//   changeStream.on('error', (error) => {
//     console.error('Error in Change Stream: ', error);
//   });
}

export function stopChangeStream() {
    console.log('stream closed dapat');
//   if (changeStream) {
//     changeStream.close();
//     console.log('Change Stream closed.');
//   }
};
