import { attributeToPosition } from "../constants/constants";

export function revealBitmapFromMapping(attributeToReveal: { [key: string]: string }): string[] {
  const reveal_bitmap = Array(90).fill('0');

  Object.entries(attributeToReveal).forEach(([attribute, reveal]) => {
    if (reveal !== "") {
      const [start, end] = attributeToPosition[attribute as keyof typeof attributeToPosition];
      reveal_bitmap.fill('1', start, end + 1);
    }
  });

  return reveal_bitmap;
}
export function revealBitmapFromAttributes(attributeToReveal: { [key: string]: boolean }): string[] {
  const reveal_bitmap = Array(90).fill('0');

  Object.entries(attributeToReveal).forEach(([attribute, reveal]) => {
    const [start, end] = attributeToPosition[attribute as keyof typeof attributeToPosition];
    reveal_bitmap.fill('1', start, end + 1);
  });

  return reveal_bitmap;
}


export function unpackReveal(revealedData_packed: string[]): string[] {

  const bytesCount = [31, 31, 28]; // nb of bytes in each of the first three field elements
  const bytesArray = revealedData_packed.flatMap((element: string, index: number) => {
    const bytes = bytesCount[index];
    const elementBigInt = BigInt(element);
    const byteMask = BigInt(255); // 0xFF
    const bytesOfElement = [...Array(bytes)].map((_, byteIndex) => {
      return (elementBigInt >> (BigInt(byteIndex) * BigInt(8))) & byteMask;
    });
    return bytesOfElement;
  });

  return bytesArray.map((byte: bigint) => String.fromCharCode(Number(byte)));
}


export function formatAndUnpackReveal(revealedData_packed: string[]): string[] {
  const revealedData_packed_formatted = [
    revealedData_packed["revealedData_packed[0]"],
    revealedData_packed["revealedData_packed[1]"],
    revealedData_packed["revealedData_packed[2]"],
  ];
  return unpackReveal(revealedData_packed_formatted);
}