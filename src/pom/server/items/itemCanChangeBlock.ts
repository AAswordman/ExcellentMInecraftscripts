const arr = ["dec:god_of_destroy", "dec:destroy_staff","wb:pickaxex_equipment_a","wb:axex_equipment_a"];

export default function itemCanChangeBlock(id: string) {
    return arr.includes(id);
}