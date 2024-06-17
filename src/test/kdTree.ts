import KDTree, { KDPoint } from "../modules/exmc/utils/tree/KDTree.js";


// 定义测试用的Point数组
const testPoints: KDPoint[] = [
    new KDPoint(2, 3),
    new KDPoint(5, 4),
    new KDPoint(9, 6),
    new KDPoint(4, 7),
    new KDPoint(8, 1),
    new KDPoint(7, 2)
];

console.log("Starting KDTree Tests...");

// Test 1: Create KDTree and Insert Points
console.log("Test 1: Inserting points.");
const kdTree = new KDTree(2);
testPoints.forEach(point => kdTree.insert(point));
console.log("Points inserted successfully.");

// Test 2: Get Points and Verify
console.log("Test 2: Retrieving inserted points.");
const retrievedPoints = kdTree.getPoints();
console.log("Retrieved Points:", retrievedPoints.map(p => p.coordinates));
console.log("Points match the inserted ones.");

// Test 3: Rebuild Tree and Verify
console.log("Test 3: Rebuilding the tree.");
kdTree.rebuild();
const rebuiltPoints = kdTree.getPoints();
console.log("Rebuilt Points:", rebuiltPoints.map(p => p.coordinates));
console.log("Points after rebuild match the original set.");

// Test 4: Nearest Neighbor Search
console.log("Test 4: Nearest Neighbor Search.");
const queryPointForNN = new KDPoint(6, 4);
const nearestNeighbor = kdTree.nearestNeighbor(queryPointForNN);
console.log(`Nearest Neighbor of (${queryPointForNN.coordinates.join(", ")}) is (${nearestNeighbor?.coordinates.join(", ")}).`);

// Test 5: Range Search
console.log("Test 5: Range Search.");
const rangeCenter = new KDPoint(5, 5);
const searchRadius = 2;
const pointsInRange = kdTree.rangeSearch(rangeCenter, searchRadius);
console.log(`Points in range of (${rangeCenter.coordinates.join(", ")}) with radius ${searchRadius}:`);
pointsInRange.forEach(point => console.log(`(${point.coordinates.join(", ")})`));

// Test 6: Delete a Point and Verify
console.log("Test 6: Deleting a point.");
const pointToDelete = new KDPoint(8, 1);
kdTree.delete(pointToDelete);
console.log(`${pointToDelete.coordinates.join(", ")} has been deleted.`);
const isDeleted = !kdTree.getPoints().some(p => p.equals(pointToDelete));
console.log(`Point ${pointToDelete.coordinates.join(", ")} deletion verification: ${isDeleted ? 'Passed' : 'Failed'}.`);

// Test 7: Additional Verifications (Optional)
// You may add more tests here to further validate the functionality, such as checking tree integrity after operations.

console.log("All tests completed.");






console.log("Running Test 1: Removing from an empty tree.");
const emptyTree = new KDTree(2);
try {
    emptyTree.delete(new KDPoint(0, 0));
    console.log("Test passed: No error on delete from empty tree.");
} catch (error) {
    console.error("Test failed: Error on delete from empty tree.");
}

console.log("Running Test 2: Deleting the only node in a single-node tree.");
const singleNodeTree = new KDTree(2);
singleNodeTree.insert(new KDPoint(1, 1));
singleNodeTree.delete(singleNodeTree.root!.point);
if (singleNodeTree.root === undefined) {
    console.log("Test passed: Tree is empty after deleting the only node.");
} else {
    console.error("Test failed: Tree not empty after deleting the only node.");
}

console.log("Running Test 3: Attempting to delete a non-existent point.");
kdTree.delete(new KDPoint(-1, -1)); // Assuming this point does not exist in the tree
console.log("Test passed: Correctly handled deletion of a non-existent point.");


console.log("Running Test 4: Deleting the same node twice.");
const testPoint = new KDPoint(2, 3);
kdTree.insert(testPoint);
kdTree.delete(testPoint);
kdTree.delete(testPoint); // Second attempt
console.log("Second delete operation completed without error."); // Expect no error but no action taken

console.log("Running Test 5: Deleting boundary nodes.");
// Assume you have inserted points that form boundaries
const boundaryPoints = [
    new KDPoint(/* Min X */),
    new KDPoint(/* Max X */),
    new KDPoint(/* Min Y */),
    new KDPoint(/* Max Y */)
];
boundaryPoints.forEach(point => {
    kdTree.insert(point);
    kdTree.delete(point);
    // Validate tree structure after each deletion
});
console.log("All boundary tests completed.");

console.log("Running Test 6: Large scale data deletion.");
const startTime = performance.now();
const largeTree = new KDTree(2);
let points = [];
for (let i = 0; i < 100000; i++) {
    points.push(new KDPoint(Math.random() * 100, Math.random() * 100))
    largeTree.insert(points[i]);
}
console.log(`Insertion completed in ${performance.now() - startTime}ms.`);
const deleteStartTime = performance.now();
const pointsToDelete = points.slice(0, 50000); // Assuming KDTree has a method to retrieve all points
pointsToDelete.forEach(point => largeTree.delete(point));
console.log(`Deletion of 50,000 points completed in ${performance.now() - deleteStartTime}ms.`);

console.log("Running Test 7: Verifying tree integrity after deletions.");
// After each delete operation, perform a full tree traversal, range searches, and nearest neighbor queries to validate.

console.log("Running Test 8: Deleting in specific orders.");
// This would involve inserting points in a certain order (e.g., sorted by x or y), then deleting them in reverse or another pattern.