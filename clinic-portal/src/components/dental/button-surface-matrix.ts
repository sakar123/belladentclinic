export type ButtonPos = 'left' | 'top' | 'right' | 'bottom' | 'center' | 'side';
export type Surface = 'M' | 'D' | 'O' | 'B' | 'L' | 'I' | 'F' | 'C';

export class ButtonSurfaceMatrix {
  static getSurface(toothNumber: number, position: ButtonPos): Surface {
    // Tooth numbers are Universal 1-32
    // Upper Right Posterior: 1-5
    // Upper Right Anterior: 6-8
    // Upper Left Anterior: 9-11
    // Upper Left Posterior: 12-16
    // Lower Left Posterior: 17-21
    // Lower Left Anterior: 22-24
    // Lower Right Anterior: 25-27
    // Lower Right Posterior: 28-32

    if (toothNumber >= 1 && toothNumber <= 5) {
      switch (position) {
        case 'left': return 'D';
        case 'right': return 'M';
        case 'top': return 'B';
        case 'bottom': return 'L';
        case 'center': return 'O';
        case 'side': return 'C';
      }
    }
    if (toothNumber >= 6 && toothNumber <= 8) {
      switch (position) {
        case 'left': return 'D';
        case 'right': return 'M';
        case 'top': return 'F';
        case 'bottom': return 'L';
        case 'center': return 'I';
        case 'side': return 'C';
      }
    }
    if (toothNumber >= 9 && toothNumber <= 11) {
      switch (position) {
        case 'left': return 'M';
        case 'right': return 'D';
        case 'top': return 'F';
        case 'bottom': return 'L';
        case 'center': return 'I';
        case 'side': return 'C';
      }
    }
    if (toothNumber >= 12 && toothNumber <= 16) {
      switch (position) {
        case 'left': return 'M';
        case 'right': return 'D';
        case 'top': return 'B';
        case 'bottom': return 'L';
        case 'center': return 'O';
        case 'side': return 'C';
      }
    }
    if (toothNumber >= 17 && toothNumber <= 21) {
      switch (position) {
        case 'left': return 'M';
        case 'right': return 'D';
        case 'top': return 'L';
        case 'bottom': return 'B';
        case 'center': return 'O';
        case 'side': return 'C';
      }
    }
    if (toothNumber >= 22 && toothNumber <= 24) {
      switch (position) {
        case 'left': return 'M';
        case 'right': return 'D';
        case 'top': return 'L';
        case 'bottom': return 'F';
        case 'center': return 'I';
        case 'side': return 'C';
      }
    }
    if (toothNumber >= 25 && toothNumber <= 27) {
      switch (position) {
        case 'left': return 'D';
        case 'right': return 'M';
        case 'top': return 'L';
        case 'bottom': return 'F';
        case 'center': return 'I';
        case 'side': return 'C';
      }
    }
    if (toothNumber >= 28 && toothNumber <= 32) {
      switch (position) {
        case 'left': return 'D';
        case 'right': return 'M';
        case 'top': return 'L';
        case 'bottom': return 'B';
        case 'center': return 'O';
        case 'side': return 'C';
      }
    }
    return 'O'; // fallback
  }
}
