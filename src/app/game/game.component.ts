import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {
  @ViewChild('hddCanvas') hddCanvas;
  private buddies = [];
  private ticks: number;
  context: CanvasRenderingContext2D;
  canvasHeight = 500;
  canvasWidth = 400;
  selectedBuddy = undefined;

  constructor() { }

  ngOnInit() {
    this.buddies.push({
      id: 1,
      img: 'assets/rabbyte-center.png',
      xPos: Math.floor(Math.random() * 400),
      yPos: Math.floor(Math.random() * 500),
      age: 0,
      basePrice: 2,
      sellPrice: 0,
      matureAge: 20
    });
  }

  ngAfterViewInit() {
    const canvas = this.hddCanvas.nativeElement;
    canvas.onclick = (e) => { this.clickBuddy(e); };
    this.context = canvas.getContext('2d');
    this.ticks = 100;
    this.drawBuddies();
    this.gameTick();
  }

  private gameTick() {
    requestAnimationFrame(() => {
      this.gameTick();
    });

    this.ticks += 1;
    if (this.ticks > 25) {
      this.ticks = 0;
      this.drawBuddies();
    }
  }

  private drawBuddies() {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.hddCanvas.nativeElement.width, this.hddCanvas.nativeElement.height);
    this.buddies.forEach((buddy, ndx) => {
      buddy.age++;
      this.calculatePrice(buddy);
      const img = new Image();
      img.src = buddy.img;
      ctx.drawImage(img, buddy.xPos, buddy.yPos, 25, 25);
      const x = buddy.xPos + Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
      const y = buddy.yPos + Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
      if (x + 25 > this.canvasWidth) {
        buddy.xPos = this.canvasWidth - 25;
      } else if (x < 0) {
        buddy.xPos = 0;
      } else {
        buddy.xPos = x;
      }
      if (y + 25 > this.canvasHeight) {
        buddy.yPos = this.canvasHeight - 25;
      } else if (y < 0) {
        buddy.yPos = 0;
      } else {
        buddy.yPos = y;
      }
    });
  }

  private clickBuddy(e: MouseEvent) {
    const canvas = this.hddCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - Math.floor(rect.left);
    const y = e.clientY - Math.floor(rect.top);
    this.selectedBuddy = this.buddies.find(b => b.xPos < x && x < b.xPos + 25 && b.yPos < y && y < b.yPos + 25);
  }

  private calculatePrice(buddy: any) {
    buddy.sellPrice = buddy.age > buddy.matureAge ?
      Math.floor(buddy.basePrice + Math.log(Math.ceil((buddy.age - buddy.matureAge) / 25))) :
      0;
  }

}
