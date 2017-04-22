import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MdlSnackbarService } from '@angular-mdl/core';
import { ByteBuddies } from '../models/byte-buddies';
import { Buddy } from '../models/buddy';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {
  @ViewChild('hddCanvas') hddCanvas;
  @ViewChild('ssdCanvas') ssdCanvas;
  private byteBuddies: ByteBuddies;
  private ticks: number;
  allBuddies: Buddy[];
  hddContext: CanvasRenderingContext2D;
  ssdContext: CanvasRenderingContext2D;
  canvasHeight = 500;
  canvasWidth = 400;
  selectedBuddy: Buddy;
  selectedSsdBuddy: Buddy;

  // Jeremys Code

  // End

  constructor(private snackbarService: MdlSnackbarService) { }

  ngOnInit() {
    this.byteBuddies = new ByteBuddies();
    this.byteBuddies.byteCoins = 0;
    this.byteBuddies.goldenBits = 0;
    this.byteBuddies.buddies = new Array<Buddy>();
    this.byteBuddies.ssdBuddies = new Array<Buddy>();

    const rabbyte = new Buddy();
    rabbyte.id = 1;
    rabbyte.name = 'red';
    rabbyte.basePrice = 2;
    rabbyte.matureAge = 20;
    rabbyte.initCost = 1;
    rabbyte.collectCost = 1;

    this.allBuddies = new Array<Buddy>();
    this.allBuddies.push({ ...rabbyte });

    rabbyte.xPos = Math.floor(Math.random() * 400);
    rabbyte.yPos = Math.floor(Math.random() * 400);
    this.byteBuddies.buddies.push(rabbyte);

    // Jeremys Code

    // End
  }

  ngAfterViewInit() {
    const hddCanvas = this.hddCanvas.nativeElement;
    hddCanvas.onclick = (e) => { this.clickBuddy(e, hddCanvas, 'hdd'); };
    this.hddContext = hddCanvas.getContext('2d');
    const ssdCanvas = this.ssdCanvas.nativeElement;
    ssdCanvas.onclick = (e) => { this.clickBuddy(e, ssdCanvas, 'ssd'); };
    this.ssdContext = ssdCanvas.getContext('2d');
    this.ticks = 100;
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
    let ctx = this.hddContext;
    ctx.clearRect(0, 0, this.hddCanvas.nativeElement.width, this.hddCanvas.nativeElement.height);
    this.byteBuddies.buddies.forEach((buddy, ndx) => {
      buddy.age++;
      this.calculatePrice(buddy);
      const img = new Image();
      buddy.img = 'assets/' + (buddy.age < buddy.matureAge ? 'egg' : buddy.name);
      switch (buddy.age % 4) {
        case 0:
          buddy.img += '1.png';
          break;
        case 1:
        case 3:
          buddy.img += '2.png';
          break;
        case 2:
        default:
          buddy.img += '3.png';
          break;
      }
      img.src = buddy.img;
      ctx.drawImage(img, buddy.xPos, buddy.yPos, 25, 25);
      if (buddy.age >= buddy.matureAge) {
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
      }
    });

    ctx = this.ssdContext;
    ctx.clearRect(0, 0, this.ssdCanvas.nativeElement.width, this.ssdCanvas.nativeElement.height);
    this.byteBuddies.ssdBuddies.forEach((buddy, ndx) => {
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

  private clickBuddy(e: MouseEvent, canvas: any, type: string) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - Math.floor(rect.left);
    const y = e.clientY - Math.floor(rect.top);
    if (type === 'hdd') {
      this.selectedBuddy = this.byteBuddies.buddies.find(b => b.xPos < x && x < b.xPos + 25 && b.yPos < y && y < b.yPos + 25);
    } else if (type === 'ssd') {
      this.selectedSsdBuddy = this.byteBuddies.ssdBuddies.find(b => b.xPos < x && x < b.xPos + 25 && b.yPos < y && y < b.yPos + 25);
    }
  }

  private calculatePrice(buddy: any) {
    buddy.sellPrice = buddy.age > buddy.matureAge ?
      Math.floor(buddy.basePrice + Math.log(Math.ceil((buddy.age - buddy.matureAge) / 25))) :
      0;
  }

  sellBuddy() {
    this.snackbarService.showToast('Sold ' + this.selectedBuddy.name + ' for ' + this.selectedBuddy.sellPrice + 'bytc', 2500);
    this.byteBuddies.buddies.splice(this.byteBuddies.buddies.findIndex(b =>
      b.id === this.selectedBuddy.id &&
      b.xPos === this.selectedBuddy.xPos &&
      b.yPos === this.selectedBuddy.yPos &&
      b.age === this.selectedBuddy.age), 1);
    this.byteBuddies.byteCoins += this.selectedBuddy.sellPrice;
    this.selectedBuddy = undefined;
  }

  sellAllBuddies(worthDouble: boolean) {
    const buddiesToSell = this.byteBuddies.buddies.filter(b => b.sellPrice >= (worthDouble ? b.basePrice * 2 : 1));
    if (buddiesToSell.length > 0) {
      buddiesToSell.forEach(b => {
        this.byteBuddies.buddies.splice(this.byteBuddies.buddies.findIndex(b2 =>
          b2.id === b.id && b2.xPos === b.xPos && b2.yPos === b.yPos && b2.age === b.age), 1);
        this.byteBuddies.byteCoins += b.sellPrice;
      });
      this.selectedBuddy = undefined;
    }
  }

  buyBuddy(buddy: Buddy) {
    this.byteBuddies.byteCoins -= buddy.initCost;
    const bought = { ...buddy };
    bought.xPos = Math.floor(Math.random() * 400);
    bought.yPos = Math.floor(Math.random() * 400);
    this.byteBuddies.buddies.push(bought);
  }

  collectBuddy(buddy: Buddy) {
    this.byteBuddies.goldenBits -= buddy.collectCost;
    const bought = { ...buddy };
    bought.xPos = Math.floor(Math.random() * 400);
    bought.yPos = Math.floor(Math.random() * 400);
    this.byteBuddies.ssdBuddies.push(bought);
  }

  // Jeremys Code

  // End

}
