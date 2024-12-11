import { getMerkleRoot } from "@metaplex-foundation/mpl-candy-machine";
import { config } from "./config";

console.log((Buffer.from(getMerkleRoot(config.allowList) as Buffer).toString('hex')));

console.log("Пожалуйста укажите данный хэш в config.json merkleRoot");
