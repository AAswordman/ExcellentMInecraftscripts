const arr = ["dec:god_of_destroy", "dec:destroy_staff"];

export default function itemCanChangeBlock(id: string) {
    return arr.includes(id);
}