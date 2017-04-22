import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MdlSnackbarService } from '@angular-mdl/core';
import { ByteBuddies } from '../models/byte-buddies';
import { Buddy } from '../models/buddy';
import { BuddyService } from '../services/buddy.service';

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

  constructor(private snackbarService: MdlSnackbarService,
    private buddyService: BuddyService) { }

  ngOnInit() {
    this.byteBuddies = new ByteBuddies();
    this.byteBuddies.byteCoins = 0;
    this.byteBuddies.goldenBits = 1;
    this.byteBuddies.buddies = new Array<Buddy>();
    this.byteBuddies.ssdBuddies = new Array<Buddy>();

    this.buddyService.getAll().subscribe(buddies => {
      if (!this.allBuddies) {
        this.allBuddies = buddies;
        this.byteBuddies.buddies.push({ ...buddies[0] });
        this.byteBuddies.buddies[0].age = 0;
        this.byteBuddies.buddies[0].xPos = Math.floor(Math.random() * 375);
        this.byteBuddies.buddies[0].yPos = Math.floor(Math.random() * 475);
      }
    });

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
      if (buddy.age > buddy.matureTime - 2 && buddy.age <= buddy.matureTime) {
        buddy.img = 'assets/eggcracking.png';
      } else {
        buddy.img = 'assets/' + (buddy.age < buddy.matureTime ? 'egg' : buddy.name);
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
      }

      img.src = buddy.img;
      buddy.width = 36;
      buddy.height = 42;
      if (buddy.age > buddy.matureTime) {
        const mod = img.width / 25;
        buddy.width = Math.floor(img.width / mod);
        buddy.height = Math.floor(img.height / mod);
      }
      ctx.drawImage(img, buddy.xPos, buddy.yPos, buddy.width, buddy.height);
      if (buddy.age >= buddy.matureTime) {
        const x = buddy.xPos + Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
        const y = buddy.yPos + Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
        if (x + buddy.width > this.canvasWidth) {
          buddy.xPos = this.canvasWidth - buddy.width;
        } else if (x < 0) {
          buddy.xPos = 0;
        } else {
          buddy.xPos = x;
        }
        if (y + buddy.height > this.canvasHeight) {
          buddy.yPos = this.canvasHeight - buddy.height;
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
      if (buddy.age > buddy.matureTime - 2 && buddy.age <= buddy.matureTime) {
        buddy.img = 'assets/eggcracking.png';
      } else {
        buddy.img = 'assets/' + (buddy.age < buddy.matureTime ? 'egg' : buddy.name);
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
      }

      img.src = buddy.img;
      buddy.width = 36;
      buddy.height = 42;
      if (buddy.age > buddy.matureTime) {
        const mod = img.width / 25;
        buddy.width = Math.floor(img.width / mod);
        buddy.height = Math.floor(img.height / mod);
      }
      ctx.drawImage(img, buddy.xPos, buddy.yPos, buddy.width, buddy.height);
      if (buddy.age >= buddy.matureTime) {
        const x = buddy.xPos + Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
        const y = buddy.yPos + Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
        if (x + buddy.width > this.canvasWidth) {
          buddy.xPos = this.canvasWidth - buddy.width;
        } else if (x < 0) {
          buddy.xPos = 0;
        } else {
          buddy.xPos = x;
        }
        if (y + buddy.height > this.canvasHeight) {
          buddy.yPos = this.canvasHeight - buddy.height;
        } else if (y < 0) {
          buddy.yPos = 0;
        } else {
          buddy.yPos = y;
        }
      }
    });
  }

  private clickBuddy(e: MouseEvent, canvas: any, type: string) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - Math.floor(rect.left);
    const y = e.clientY - Math.floor(rect.top);
    if (type === 'hdd') {
      this.selectedBuddy = this.byteBuddies.buddies.find(b =>
        b.xPos < x && x < b.xPos + b.width && b.yPos < y && y < b.yPos + b.height);
    } else if (type === 'ssd') {
      this.selectedSsdBuddy = this.byteBuddies.ssdBuddies.find(b =>
        b.xPos < x && x < b.xPos + b.width && b.yPos < y && y < b.yPos + b.height);
    }
  }

  private calculatePrice(buddy: Buddy) {
    buddy.sellPrice = +(buddy.age > buddy.matureTime ?
      Math.floor(+buddy.minPrice + Math.log(Math.ceil((buddy.age - buddy.matureTime) / 25))) :
      0);
  }

  sellBuddy() {
    this.byteBuddies.buddies.splice(this.byteBuddies.buddies.findIndex(b =>
      b.xPos === this.selectedBuddy.xPos &&
      b.yPos === this.selectedBuddy.yPos &&
      b.age === this.selectedBuddy.age), 1);
    this.byteBuddies.byteCoins += this.selectedBuddy.sellPrice;
    const goldenChance = +this.selectedBuddy.minPrice / 10;
    let numGoldens = Math.floor(goldenChance / 100);
    if (Math.random() <= goldenChance) {
      numGoldens++;
    }
    this.byteBuddies.goldenBits += numGoldens;
    this.snackbarService.showToast('Sold ' + this.selectedBuddy.name + ' for ' + this.selectedBuddy.sellPrice +
      'bytc' + (numGoldens > 0 ? (' and ' + numGoldens + ' gb') : ''), 2500);
    this.selectedBuddy = undefined;
  }

  sellAllBuddies(worthDouble: boolean) {
    let totalBytc = 0;
    let totalGoldens = 0;
    const buddiesToSell = this.byteBuddies.buddies.filter(b => b.sellPrice >= (worthDouble ? +b.minPrice * 2 : 1));
    const totalBuddies = buddiesToSell.length;
    if (buddiesToSell.length > 0) {
      buddiesToSell.forEach(b => {
        this.byteBuddies.buddies.splice(this.byteBuddies.buddies.findIndex(b2 =>
          b2.xPos === b.xPos && b2.yPos === b.yPos && b2.age === b.age), 1);
        this.byteBuddies.byteCoins += b.sellPrice;
        totalBytc += b.sellPrice;
        const goldenChance = +b.minPrice / 10;
        let numGoldens = Math.floor(goldenChance / 100);
        if (Math.random() <= goldenChance) {
          numGoldens++;
        }
        totalGoldens += numGoldens;
        this.byteBuddies.goldenBits += numGoldens;
      });
      this.selectedBuddy = undefined;
      this.snackbarService.showToast('Sold ' + totalBuddies + ' buddies for ' + totalBytc +
        'bytc' + (totalGoldens > 0 ? (' and ' + totalGoldens + ' gb') : ''), 2500);
    }
  }

  buyBuddy(buddy: Buddy) {
    this.byteBuddies.byteCoins -= buddy.initCost;
    const bought = { ...buddy };
    bought.age = 0;
    bought.xPos = Math.floor(Math.random() * 375);
    bought.yPos = Math.floor(Math.random() * 475);
    this.byteBuddies.buddies.push(bought);
  }

  collectBuddy(buddy: Buddy) {
    this.byteBuddies.goldenBits -= buddy.collectCost;
    const bought = { ...buddy };
    bought.age = 0;
    bought.xPos = Math.floor(Math.random() * 375);
    bought.yPos = Math.floor(Math.random() * 475);
    this.byteBuddies.ssdBuddies.push(bought);
  }

  // Jeremys Code

  // End

}
