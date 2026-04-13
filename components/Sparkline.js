/**
 * Represents a lightweight sparkline chart for visualizing price trends.
 * Renders data points onto a 2D canvas with a gradient fill.
 */
export class Sparkline {
  /**
   * Initializes the sparkline chart.
   * @param {HTMLCanvasElement} canvasElement - The canvas element to render on.
   * @param {string} [color='#00D2A6'] - The primary stroke color for the line.
   */
  constructor(canvasElement, color = '#00D2A6') {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.color = color;
    this.dataPoints = [];
    this.maxPoints = 40;
    
    // Resize slightly for high DPI
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 60; // Fixed small height
  }

  /**
   * Adds a new data point to the sparkline and triggers a redraw.
   * Automatically shifts old data points if the limit is reached.
   * @param {number} price - The price value to add.
   */
  addPoint(price) {
    this.dataPoints.push(price);
    if (this.dataPoints.length > this.maxPoints) {
      this.dataPoints.shift();
    }
    this.draw();
  }

  /**
   * Renders the sparkline on the canvas.
   * Calculates scaling based on the min/max values of the data points.
   * @private
   */
  draw() {
    if (this.dataPoints.length < 2) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const min = Math.min(...this.dataPoints);
    const max = Math.max(...this.dataPoints);
    const range = max - min || 1; 

    const stepX = this.canvas.width / (this.maxPoints - 1);
    
    this.ctx.beginPath();
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.color;

    for (let i = 0; i < this.dataPoints.length; i++) {
        const val = this.dataPoints[i];
        // Normalize 0 to 1, then mapped to height with a little padding (5px)
        const normalized = (val - min) / range;
        const x = i * stepX;
        const y = this.canvas.height - 5 - (normalized * (this.canvas.height - 10));

        if (i === 0) {
            this.ctx.moveTo(x, y);
        } else {
            this.ctx.lineTo(x, y);
        }
    }
    this.ctx.stroke();

    // Create gradient fill under the line
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, `${this.color}88`); // 50% opacity
    gradient.addColorStop(1, `${this.color}00`); // 0% opacity

    this.ctx.lineTo(this.canvas.width, this.canvas.height);
    this.ctx.lineTo(0, this.canvas.height);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }
}
