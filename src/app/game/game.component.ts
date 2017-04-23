import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { MdlSnackbarService } from '@angular-mdl/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Message } from 'primeng/primeng';
import { ByteBuddies } from '../models/byte-buddies';
import { Buddy } from '../models/buddy';
import { ComputerComponent } from '../models/computer-component';
import { BreedStats } from '../models/breed-stats';
import { CloneStats } from '../models/clone-stats';
import { Stat } from '../models/stat';
import { Achievement } from '../models/achievement';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {
  @ViewChild('hddCanvas') hddCanvas;
  @ViewChild('ssdCanvas') ssdCanvas;
  private ticks: number;
  private saveTicks: number;
  byteBuddies: ByteBuddies;
  allBuddies: Buddy[];
  allAchievements: Achievement[];
  purchaseableBuddies: Buddy[];
  allCpus: ComputerComponent[];
  allGpus: ComputerComponent[];
  allRams: ComputerComponent[];
  allHdds: ComputerComponent[];
  hddContext: CanvasRenderingContext2D;
  ssdContext: CanvasRenderingContext2D;
  canvasHeight = 500;
  canvasWidth = 400;
  selectedBuddy: Buddy;
  selectedSsdBuddy: Buddy;
  nextHdd: ComputerComponent;
  nextCpu: ComputerComponent;
  nextGpu: ComputerComponent;
  nextRam: ComputerComponent;
  currEggs: number;
  cloneBuddy: Buddy;
  cloneStats: CloneStats;
  breedBuddy1: Buddy;
  breedBuddy2: Buddy;
  breedStats: BreedStats;
  breedList: Buddy[];
  loading = true;
  toasts: Message[] = [];

  constructor(private snackbarService: MdlSnackbarService, private af: AngularFire, private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    let newGame = true;
    if (localStorage.getItem('byteBuddies')) {
      newGame = false;
      try {
        this.byteBuddies = JSON.parse(this.decryptSave(localStorage.getItem('byteBuddies')));
      } catch (e) {
        this.byteBuddies = JSON.parse(localStorage.getItem('byteBuddies'));
      }
      this.snackbarService.showToast('Game Loaded', 2500);
      this.currEggs = this.byteBuddies.buddies.filter(b => b.age < b.matureTime).length;
    } else {
      this.byteBuddies = new ByteBuddies();
      this.byteBuddies.byteCoins = 0;
      this.byteBuddies.goldenBits = 0;
      this.byteBuddies.buddies = new Array<Buddy>();
      this.byteBuddies.ssdBuddies = new Array<Buddy>();
      this.byteBuddies.stats = new Array<Stat>();
      this.byteBuddies.achievements = new Array<number>();
    }
    this.af.database.list('/buddies/').subscribe((buddies: Buddy[]) => {
      if (!this.allBuddies) {
        this.allBuddies = buddies;
        this.allBuddies = buddies.sort((a, b) => {
          if (a.initCost === b.initCost) { return 0; };
          return +a.initCost < +b.initCost ? -1 : 1;
        });
        if (newGame) {
          this.currEggs = 1;
          this.byteBuddies.buddies.push({ ...buddies.find(b => b.name === 'Rabbyte') });
          this.byteBuddies.buddies[0].age = 0;
          this.byteBuddies.buddies[0].fullName = this.byteBuddies.buddies[0].name;
          this.byteBuddies.buddies[0].evolution = '';
          this.byteBuddies.buddies[0].xPos = Math.floor(Math.random() * 375);
          this.byteBuddies.buddies[0].yPos = Math.floor(Math.random() * 475);
          this.purchaseableBuddies = this.allBuddies.filter(b => +b.requiredCPU === 1);
        } else {
          this.purchaseableBuddies = this.allBuddies.filter(b => +b.requiredCPU <= +this.byteBuddies.cpu.level);
        }
        this.breedList = new Array<Buddy>(...this.byteBuddies.buddies);
        this.loading = false;
      }
    });

    this.af.database.list('/components/CPU/').subscribe((cpus: ComputerComponent[]) => {
      this.allCpus = cpus.sort((a, b) => {
        if (a.level === b.level) { return 0; };
        return +a.level < +b.level ? -1 : 1;
      });
      if (newGame || !this.byteBuddies.cpu) {
        this.byteBuddies.cpu = cpus[0];
      }
      const nextIndex = cpus.findIndex(c => c.name === this.byteBuddies.cpu.name) + 1;
      if (nextIndex < cpus.length) {
        this.nextCpu = cpus[nextIndex];
      } else {
        this.nextCpu = undefined;
      }
    });

    this.af.database.list('/components/HDD/').subscribe((hdds: ComputerComponent[]) => {
      this.allHdds = hdds.sort((a, b) => {
        if (a.level === b.level) { return 0; };
        return +a.level < +b.level ? -1 : 1;
      });
      if (newGame || !this.byteBuddies.hdd) {
        this.byteBuddies.hdd = hdds[0];
      }
      const nextIndex = hdds.findIndex(c => c.name === this.byteBuddies.hdd.name) + 1;
      if (nextIndex < hdds.length) {
        this.nextHdd = hdds[nextIndex];
      } else {
        this.nextHdd = undefined;
      }
    });

    this.af.database.list('/components/GPU/').subscribe((gpus: ComputerComponent[]) => {
      this.allGpus = gpus.sort((a, b) => {
        if (a.level === b.level) { return 0; };
        return +a.level < +b.level ? -1 : 1;
      });
      if (newGame || !this.byteBuddies.gpu) {
        this.byteBuddies.gpu = gpus[0];
      }
      const nextIndex = gpus.findIndex(c => c.name === this.byteBuddies.gpu.name) + 1;
      if (nextIndex < gpus.length) {
        this.nextGpu = gpus[nextIndex];
      } else {
        this.nextGpu = undefined;
      }
    });

    this.af.database.list('/components/RAM/').subscribe((rams: ComputerComponent[]) => {
      this.allRams = rams.sort((a, b) => {
        if (a.level === b.level) { return 0; };
        return +a.level < +b.level ? -1 : 1;
      });
      if (newGame || !this.byteBuddies.ram) {
        this.byteBuddies.ram = rams[0];
      }
      const nextIndex = rams.findIndex(c => c.name === this.byteBuddies.ram.name) + 1;
      if (nextIndex < rams.length) {
        this.nextRam = rams[nextIndex];
      } else {
        this.nextRam = undefined;
      }
    });

    this.af.database.list('/achievements/').subscribe((achs: Achievement[]) => {
      this.allAchievements = achs.sort((a, b) => {
        if (a.type === b.type) {
          return +a.byteReward < +b.byteReward ? -1 : 1;
        };
        return +a.type < +b.type ? -1 : 1;
      });
      let lastType = -1;
      let number = 1;
      this.allAchievements.forEach(a => {
        if (+lastType !== +a.type) {
          number = 1;
          lastType = a.type;
        }
        a.image = this.domSanitizer.bypassSecurityTrustStyle('url(assets/' + a.type + '.png');
        a.colorClass = 'ach-' + number;
        number++;
      });
    });
  }

  ngAfterViewInit() {
    const hddCanvas = this.hddCanvas.nativeElement;
    hddCanvas.onclick = (e) => { this.clickBuddy(e, hddCanvas, 'hdd'); };
    this.hddContext = hddCanvas.getContext('2d');
    const ssdCanvas = this.ssdCanvas.nativeElement;
    ssdCanvas.onclick = (e) => { this.clickBuddy(e, ssdCanvas, 'ssd'); };
    this.ssdContext = ssdCanvas.getContext('2d');
    this.ticks = 100;
    this.saveTicks = 0;
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

    this.saveTicks += 1;
    if (this.saveTicks > 5000) {
      this.saveTicks = 0;
      this.saveGame();
    }

    if (!this.loading && +this.byteBuddies.byteCoins === 0 && this.byteBuddies.buddies.length === 0) {
      this.byteBuddies.byteCoins = 1;
      this.snackbarService.showToast('You should avoid spending your last coin. Here\'s a free one', 5000);
    }
  }

  private encryptSave = function (str) {
    let retval = '';
    let i = 0;
    while (i !== str.length) {
      retval += str.charCodeAt(i++).toString(16);
    }
    return retval;
  };

  private decryptSave = function (str) {
    let retval = '';
    let i = 0;
    while (i !== str.length) {
      retval += String.fromCharCode(parseInt(str.substr(i, 2), 16));
      i += 2;
    }
    return retval;
  };

  saveGame() {
    localStorage.setItem('byteBuddies', this.encryptSave(JSON.stringify(this.byteBuddies)));
    this.snackbarService.showToast('Game Saved', 1000);
  }

  clearSave() {
    localStorage.removeItem('byteBuddies');
    this.snackbarService.showToast('Storage Cleared', 1000);
    location.reload(true);
  }

  buyCpu() {
    this.incrementStat('Upgrades Bought (Total)');
    this.incrementStat('Upgrades Bought (CPU)');
    this.byteBuddies.byteCoins -= +this.nextCpu.cost;
    this.byteBuddies.cpu = this.nextCpu;
    this.purchaseableBuddies = this.allBuddies.filter(b => +b.requiredCPU <= +this.byteBuddies.cpu.level);
    const nextIndex = this.allCpus.findIndex(c => c.name === this.byteBuddies.cpu.name) + 1;
    if (nextIndex < this.allCpus.length) {
      this.nextCpu = this.allCpus[nextIndex];
    } else {
      this.nextCpu = undefined;
    }
  }

  buyHdd() {
    this.incrementStat('Upgrades Bought (Total)');
    this.incrementStat('Upgrades Bought (HDD)');
    this.byteBuddies.byteCoins -= +this.nextHdd.cost;
    this.byteBuddies.hdd = this.nextHdd;
    const nextIndex = this.allHdds.findIndex(c => c.name === this.byteBuddies.hdd.name) + 1;
    if (nextIndex < this.allHdds.length) {
      this.nextHdd = this.allHdds[nextIndex];
    } else {
      this.nextHdd = undefined;
    }
  }

  buyGpu() {
    this.incrementStat('Upgrades Bought (Total)');
    this.incrementStat('Upgrades Bought (GPU)');
    this.byteBuddies.byteCoins -= +this.nextGpu.cost;
    this.byteBuddies.gpu = this.nextGpu;
    const nextIndex = this.allGpus.findIndex(c => c.name === this.byteBuddies.gpu.name) + 1;
    if (nextIndex < this.allGpus.length) {
      this.nextGpu = this.allGpus[nextIndex];
    } else {
      this.nextGpu = undefined;
    }
  }

  buyRam() {
    this.incrementStat('Upgrades Bought (Total)');
    this.incrementStat('Upgrades Bought (RAM)');
    this.byteBuddies.byteCoins -= +this.nextRam.cost;
    this.byteBuddies.ram = this.nextRam;
    const nextIndex = this.allRams.findIndex(c => c.name === this.byteBuddies.ram.name) + 1;
    if (nextIndex < this.allRams.length) {
      this.nextRam = this.allRams[nextIndex];
    } else {
      this.nextRam = undefined;
    }
  }

  private drawBuddies() {
    let ctx = this.hddContext;
    ctx.clearRect(0, 0, this.hddCanvas.nativeElement.width, this.hddCanvas.nativeElement.height);
    this.byteBuddies.buddies.forEach((buddy, ndx) => {
      buddy.age++;
      this.calculatePrice(buddy);
      const img = new Image();
      if (buddy.age === +buddy.matureTime) {
        this.currEggs--;
        this.incrementStat('Eggs Hatched (Total)');
        this.incrementStat('Eggs Hatched (' + buddy.fullName + ')');
      }
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
        let mod = 15;
        if (buddy.evolution === 'Kilo') {
          mod = 13;
        } else if (buddy.evolution === 'Mega') {
          mod = 11;
        } else if (buddy.evolution === 'Giga') {
          mod = 9;
        } else if (buddy.evolution === 'Tera') {
          mod = 7;
        }
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
        let mod = 15;
        if (buddy.evolution === 'Kilo') {
          mod = 12;
        } else if (buddy.evolution === 'Mega') {
          mod = 9;
        } else if (buddy.evolution === 'Giga') {
          mod = 6;
        } else if (buddy.evolution === 'Tera') {
          mod = 3;
        }
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
      if (this.selectedBuddy) {
        this.incrementStat('Buddies Selected (In HDD)');
      }
    } else if (type === 'ssd') {
      this.selectedSsdBuddy = this.byteBuddies.ssdBuddies.find(b =>
        b.xPos < x && x < b.xPos + b.width && b.yPos < y && y < b.yPos + b.height);
      if (this.selectedSsdBuddy) {
        this.incrementStat('Buddies Selected (In SSD)');
      }
    }
  }

  private calculatePrice(buddy: Buddy) {
    let price = +(buddy.age > buddy.matureTime ?
      Math.floor(+buddy.minPrice + Math.log(Math.ceil((buddy.age - buddy.matureTime) / 50)) * +buddy.minPrice) :
      0);
    if (buddy.evolution === 'Kilo') {
      price = Math.floor(price * 1.5);
    } else if (buddy.evolution === 'Mega') {
      price *= 4;
    } else if (buddy.evolution === 'Giga') {
      price *= 10;
    } else if (buddy.evolution === 'Tera') {
      price *= 25;
    }
    buddy.sellPrice = price;
  }

  sellBuddy() {
    this.incrementStat('Buddies Sold (Total)');
    this.incrementStat('Buddies Sold (' + this.selectedBuddy.fullName + ')');
    this.byteBuddies.buddies.splice(this.byteBuddies.buddies.findIndex(b =>
      b.xPos === this.selectedBuddy.xPos &&
      b.yPos === this.selectedBuddy.yPos &&
      b.age === this.selectedBuddy.age), 1);
    this.byteBuddies.byteCoins += this.selectedBuddy.sellPrice;
    const goldenChance = +this.selectedBuddy.minPrice * 0.001;
    let numGoldens = Math.floor(goldenChance / 100);
    if (Math.random() <= goldenChance) {
      numGoldens++;
    }
    this.byteBuddies.goldenBits += numGoldens;
    this.snackbarService.showToast('Sold ' + this.selectedBuddy.name + ' for ' + this.selectedBuddy.sellPrice +
      'bytc' + (numGoldens > 0 ? (' and ' + numGoldens + ' gb') : ''), 2500);
    this.selectedBuddy = undefined;
  }

  sellSsdBuddy() {
    this.incrementStat('Collected Buddies Sold');
    this.incrementStat('Collected Buddies Sold (' + this.selectedSsdBuddy.fullName + ')');
    this.byteBuddies.ssdBuddies.splice(this.byteBuddies.ssdBuddies.findIndex(b =>
      b.xPos === this.selectedSsdBuddy.xPos &&
      b.yPos === this.selectedSsdBuddy.yPos &&
      b.age === this.selectedSsdBuddy.age), 1);
    this.byteBuddies.byteCoins += this.selectedSsdBuddy.sellPrice;
    this.snackbarService.showToast('Sold ' + this.selectedSsdBuddy.name + ' for ' + this.selectedSsdBuddy.sellPrice + 'bytc', 2500);
    this.selectedSsdBuddy = undefined;
  }

  sellAllBuddies(worthDouble: boolean) {
    let totalBytc = 0;
    let totalGoldens = 0;
    const buddiesToSell = this.byteBuddies.buddies.filter(b => b.evolution === '' && b.name !== 'Dragonbyte' &&
      b.sellPrice >= (worthDouble ? +b.minPrice * 2 : 1));
    const totalBuddies = buddiesToSell.length;
    if (buddiesToSell.length > 0) {
      buddiesToSell.forEach(b => {
        this.incrementStat('Buddies Sold');
        this.incrementStat('Buddies Sold (' + b.fullName + ')');
        this.byteBuddies.buddies.splice(this.byteBuddies.buddies.findIndex(b2 =>
          b2.xPos === b.xPos && b2.yPos === b.yPos && b2.age === b.age), 1);
        this.byteBuddies.byteCoins += b.sellPrice;
        totalBytc += b.sellPrice;
        const goldenChance = +b.minPrice * 0.001;
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
    this.incrementStat('Buddies Bought (Total)');
    this.incrementStat('Buddies Bought (' + buddy.name + ')');
    this.byteBuddies.byteCoins -= buddy.initCost;
    this.getBuddy(buddy, '');
  }

  getBuddy(buddy: Buddy, evolution: string) {
    const newBuddy = { ...buddy };
    newBuddy.age = 0;
    newBuddy.evolution = evolution;
    newBuddy.xPos = Math.floor(Math.random() * 375);
    newBuddy.yPos = Math.floor(Math.random() * 475);
    newBuddy.fullName = newBuddy.evolution + newBuddy.name;
    this.currEggs++;
    this.byteBuddies.buddies.push(newBuddy);
  }

  collectBuddy(buddy: Buddy) {
    this.incrementStat('Buddies Collected (Total)');
    this.incrementStat('Buddies Collected (' + buddy.name + ')');
    this.byteBuddies.goldenBits -= buddy.collectCost;
    this.byteBuddies.ssdBuddies.push(
      this.byteBuddies.buddies.splice(
        this.byteBuddies.buddies.findIndex(b => +buddy.age === +b.age && buddy.name === b.name &&
          buddy.evolution === b.evolution && +b.xPos === +buddy.xPos && +b.yPos === +buddy.yPos), 1)[0]);
  }

  cloneChange(value: any) {
    this.cloneBuddy = undefined;
    this.cloneStats = undefined;
    if (value && value.evolution !== '') {
      this.cloneBuddy = value;
      this.cloneStats = new CloneStats();
      this.cloneStats.buddy = this.cloneBuddy;
      this.cloneStats.byteCoinCost = this.cloneBuddy.sellPrice * 5;
      this.cloneStats.goldenBitCost = this.cloneBuddy.collectCost * 5;
    }
  }

  clonedBuddy() {
    this.incrementStat('Buddies Cloned (Total)');
    this.incrementStat('Buddies Cloned (' + this.cloneBuddy.name + ')');
    this.byteBuddies.byteCoins -= this.cloneStats.byteCoinCost;
    this.byteBuddies.goldenBits -= this.cloneStats.goldenBitCost;
    this.getBuddy(this.cloneBuddy, this.cloneBuddy.evolution);
  }

  breed1Change(value: any) {
    this.breedBuddy1 = value;
    this.getBreedStats();
  }

  breed2Change(value: any) {
    this.breedBuddy2 = value;
    this.getBreedStats();
  }

  getBreedStats() {
    let success = false;
    this.breedStats = undefined;
    if (this.breedBuddy1 && this.breedBuddy1.age < this.breedBuddy1.matureTime) {
      this.snackbarService.showToast('The buddy needs to have hatched to breed it!', 5000);
    } else if (this.breedBuddy2 && this.breedBuddy2.age < this.breedBuddy2.matureTime) {
      this.snackbarService.showToast('The buddy needs to have hatched to breed it!', 5000);
    } else if (this.breedBuddy1 && this.breedBuddy2) {
      if (this.breedBuddy1.age === this.breedBuddy2.age && this.breedBuddy1.name === this.breedBuddy2.name
        && this.breedBuddy1.xPos === this.breedBuddy2.xPos && this.breedBuddy1.yPos === this.breedBuddy2.yPos) {
        this.snackbarService.showToast('You have to select 2 different Buddies.', 5000);
      } else if (this.breedBuddy1.evolution !== this.breedBuddy2.evolution) {
        this.snackbarService.showToast('The buddies have to be at the same evolution level.', 5000);
      } else if ((this.breedBuddy1.evolution === 'Kilo' && +this.byteBuddies.gpu.level <= 2) ||
        (this.breedBuddy1.evolution === 'Mega' && +this.byteBuddies.gpu.level <= 3) ||
        (this.breedBuddy1.evolution === 'Giga' && +this.byteBuddies.gpu.level <= 4) ||
        (this.breedBuddy1.evolution === 'Tera' && +this.byteBuddies.gpu.level <= 5)) {
        this.snackbarService.showToast('You need to upgrade your GPU to evolve past this level.', 5000);
      } else {
        success = true;
        this.breedStats = new BreedStats();
        this.breedStats.buddy1 = this.breedBuddy1;
        this.breedStats.buddy2 = this.breedBuddy2;
        if (this.breedBuddy1.evolution === '') {
          this.breedStats.evolveChance = 75;
          this.breedStats.sameChance = 25;
        } else if (this.breedBuddy1.evolution === 'Kilo') {
          this.breedStats.evolveChance = 50;
          this.breedStats.sameChance = 35;
          this.breedStats.devolveChance = 15;
        } else if (this.breedBuddy1.evolution === 'Mega') {
          this.breedStats.evolveChance = 40;
          this.breedStats.sameChance = 40;
          this.breedStats.devolveChance = 20;
        } else if (this.breedBuddy1.evolution === 'Giga') {
          this.breedStats.evolveChance = 30;
          this.breedStats.sameChance = 45;
          this.breedStats.devolveChance = 25;
        } else if (this.breedBuddy1.evolution === 'Tera') {
          this.breedStats.evolveChance = 20;
          this.breedStats.sameChance = 50;
          this.breedStats.devolveChance = 30;
        }
      }
    }
  }

  breedBuddies() {
    this.breedList = [];
    this.byteBuddies.buddies.splice(this.byteBuddies.buddies.findIndex(b =>
      b.xPos === this.breedBuddy1.xPos &&
      b.yPos === this.breedBuddy1.yPos &&
      b.age === this.breedBuddy1.age), 1);
    this.byteBuddies.buddies.splice(this.byteBuddies.buddies.findIndex(b =>
      b.xPos === this.breedBuddy2.xPos &&
      b.yPos === this.breedBuddy2.yPos &&
      b.age === this.breedBuddy2.age), 1);
    const chance = Math.random();
    const parent = Math.random() > 0.5 ? { ...this.breedBuddy1 } : { ...this.breedBuddy2 };
    this.breedBuddy1 = undefined;
    this.breedBuddy2 = undefined;
    this.incrementStat('Buddies Bred (Total)');
    this.incrementStat('Buddies Bred (' + parent.name + ')');

    this.breedList = new Array<Buddy>(...this.byteBuddies.buddies);
    let evolution = '';
    if (chance <= 0.01) {
      this.snackbarService.showToast('You bred a super rare Dragonbyte!');
      this.getBuddy(this.allBuddies.find(b => b.name === 'Dragonbyte'), '');

    } else if (chance > (100 - this.breedStats.evolveChance) / 100) {
      parent.collectCost *= 2;
      if (parent.evolution === '') {
        evolution = 'Kilo';
      } else if (parent.evolution === 'Kilo') {
        evolution = 'Mega';
      } else if (parent.evolution === 'Mega') {
        evolution = 'Giga';
      } else if (parent.evolution === 'Giga') {
        evolution = 'Tera';
      }
      this.incrementStat('Buddies Evolved (Total)');
      this.incrementStat('Buddies Evolved (' + parent.name + ')');
      this.snackbarService.showToast('You evolved a ' + evolution + parent.name + '!');
      this.getBuddy(parent, evolution);

    } else if (chance > (100 - this.breedStats.evolveChance - this.breedStats.sameChance) / 100) {
      this.snackbarService.showToast('You bred another ' + parent.evolution + parent.name + '!');
      this.getBuddy(parent, parent.evolution);

    } else {
      parent.collectCost /= 2;
      if (parent.evolution === 'Kilo') {
        evolution = '';
      } else if (parent.evolution === 'Mega') {
        evolution = 'Kilo';
      } else if (parent.evolution === 'Giga') {
        evolution = 'Mega';
      } else if (parent.evolution === 'Tera') {
        evolution = 'Giga';
      }
      this.incrementStat('Buddies Devolved (Total)');
      this.incrementStat('Buddies Devolved (' + parent.name + ')');
      this.snackbarService.showToast('You bred a devolved ' + evolution + parent.name + '. :-(');
      this.getBuddy(parent, evolution);
    }
    this.breedStats = undefined;
  }

  incrementStat(name: string) {
    let stat = this.byteBuddies.stats.find(s => s.name === name);
    if (!stat) {
      stat = new Stat();
      stat.name = name;
      stat.value = 1;
      this.byteBuddies.stats.push(stat);
      this.byteBuddies.stats = this.byteBuddies.stats.sort((a, b) => {
        if (a.name === b.name) { return 0; };
        return a.name < b.name ? -1 : 1;
      });
    } else {
      stat.value++;
    }
    this.tryAchievements(stat);
  }

  tryAchievements(stat: Stat) {
    if (stat.name === 'Eggs Hatched (Rabbyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(4);
          break;
        case 2:
          this.unlockAchievement(22);
          break;
        case 5:
          this.unlockAchievement(40);
          break;
        case 25:
          this.unlockAchievement(58);
          break;
        case 50:
          this.unlockAchievement(76);
          break;
        case 100:
          this.unlockAchievement(94);
          break;
        case 250:
          this.unlockAchievement(112);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Centibyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(5);
          break;
        case 2:
          this.unlockAchievement(23);
          break;
        case 5:
          this.unlockAchievement(41);
          break;
        case 25:
          this.unlockAchievement(59);
          break;
        case 50:
          this.unlockAchievement(77);
          break;
        case 100:
          this.unlockAchievement(95);
          break;
        case 250:
          this.unlockAchievement(113);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Mantabyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(6);
          break;
        case 2:
          this.unlockAchievement(24);
          break;
        case 5:
          this.unlockAchievement(42);
          break;
        case 25:
          this.unlockAchievement(60);
          break;
        case 50:
          this.unlockAchievement(78);
          break;
        case 100:
          this.unlockAchievement(96);
          break;
        case 250:
          this.unlockAchievement(114);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Jellybyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(7);
          break;
        case 2:
          this.unlockAchievement(25);
          break;
        case 5:
          this.unlockAchievement(43);
          break;
        case 25:
          this.unlockAchievement(61);
          break;
        case 50:
          this.unlockAchievement(79);
          break;
        case 100:
          this.unlockAchievement(97);
          break;
        case 250:
          this.unlockAchievement(115);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Trilobyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(8);
          break;
        case 2:
          this.unlockAchievement(26);
          break;
        case 5:
          this.unlockAchievement(44);
          break;
        case 25:
          this.unlockAchievement(62);
          break;
        case 50:
          this.unlockAchievement(80);
          break;
        case 100:
          this.unlockAchievement(98);
          break;
        case 250:
          this.unlockAchievement(116);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Ammobyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(9);
          break;
        case 2:
          this.unlockAchievement(27);
          break;
        case 5:
          this.unlockAchievement(45);
          break;
        case 25:
          this.unlockAchievement(63);
          break;
        case 50:
          this.unlockAchievement(81);
          break;
        case 100:
          this.unlockAchievement(99);
          break;
        case 250:
          this.unlockAchievement(117);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Goldiebyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(10);
          break;
        case 2:
          this.unlockAchievement(28);
          break;
        case 5:
          this.unlockAchievement(46);
          break;
        case 25:
          this.unlockAchievement(64);
          break;
        case 50:
          this.unlockAchievement(82);
          break;
        case 100:
          this.unlockAchievement(100);
          break;
        case 250:
          this.unlockAchievement(118);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Narwhalbyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(11);
          break;
        case 2:
          this.unlockAchievement(29);
          break;
        case 5:
          this.unlockAchievement(47);
          break;
        case 25:
          this.unlockAchievement(65);
          break;
        case 50:
          this.unlockAchievement(83);
          break;
        case 100:
          this.unlockAchievement(101);
          break;
        case 250:
          this.unlockAchievement(119);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Starbyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(12);
          break;
        case 2:
          this.unlockAchievement(30);
          break;
        case 5:
          this.unlockAchievement(48);
          break;
        case 25:
          this.unlockAchievement(66);
          break;
        case 50:
          this.unlockAchievement(84);
          break;
        case 100:
          this.unlockAchievement(102);
          break;
        case 250:
          this.unlockAchievement(120);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Puffbyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(13);
          break;
        case 2:
          this.unlockAchievement(31);
          break;
        case 5:
          this.unlockAchievement(49);
          break;
        case 25:
          this.unlockAchievement(67);
          break;
        case 50:
          this.unlockAchievement(85);
          break;
        case 100:
          this.unlockAchievement(103);
          break;
        case 250:
          this.unlockAchievement(121);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Turtlebyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(14);
          break;
        case 2:
          this.unlockAchievement(32);
          break;
        case 5:
          this.unlockAchievement(50);
          break;
        case 25:
          this.unlockAchievement(68);
          break;
        case 50:
          this.unlockAchievement(86);
          break;
        case 100:
          this.unlockAchievement(104);
          break;
        case 250:
          this.unlockAchievement(122);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Pigbyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(15);
          break;
        case 2:
          this.unlockAchievement(33);
          break;
        case 5:
          this.unlockAchievement(51);
          break;
        case 25:
          this.unlockAchievement(69);
          break;
        case 50:
          this.unlockAchievement(87);
          break;
        case 100:
          this.unlockAchievement(105);
          break;
        case 250:
          this.unlockAchievement(123);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Mousiebyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(16);
          break;
        case 2:
          this.unlockAchievement(34);
          break;
        case 5:
          this.unlockAchievement(52);
          break;
        case 25:
          this.unlockAchievement(70);
          break;
        case 50:
          this.unlockAchievement(88);
          break;
        case 100:
          this.unlockAchievement(106);
          break;
        case 250:
          this.unlockAchievement(124);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Crabbyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(17);
          break;
        case 2:
          this.unlockAchievement(35);
          break;
        case 5:
          this.unlockAchievement(53);
          break;
        case 25:
          this.unlockAchievement(71);
          break;
        case 50:
          this.unlockAchievement(89);
          break;
        case 100:
          this.unlockAchievement(107);
          break;
        case 250:
          this.unlockAchievement(125);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Horsiebyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(18);
          break;
        case 2:
          this.unlockAchievement(36);
          break;
        case 5:
          this.unlockAchievement(54);
          break;
        case 25:
          this.unlockAchievement(72);
          break;
        case 50:
          this.unlockAchievement(90);
          break;
        case 100:
          this.unlockAchievement(108);
          break;
        case 250:
          this.unlockAchievement(126);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Octobyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(19);
          break;
        case 2:
          this.unlockAchievement(37);
          break;
        case 5:
          this.unlockAchievement(55);
          break;
        case 25:
          this.unlockAchievement(73);
          break;
        case 50:
          this.unlockAchievement(91);
          break;
        case 100:
          this.unlockAchievement(109);
          break;
        case 250:
          this.unlockAchievement(127);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Geoffreybyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(20);
          break;
        case 2:
          this.unlockAchievement(38);
          break;
        case 5:
          this.unlockAchievement(56);
          break;
        case 25:
          this.unlockAchievement(74);
          break;
        case 50:
          this.unlockAchievement(92);
          break;
        case 100:
          this.unlockAchievement(110);
          break;
        case 250:
          this.unlockAchievement(128);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Dragonbyte)') {
      switch(stat.value) {
        case 1:
          this.unlockAchievement(21);
          break;
        case 2:
          this.unlockAchievement(39);
          break;
        case 5:
          this.unlockAchievement(57);
          break;
        case 25:
          this.unlockAchievement(75);
          break;
        case 50:
          this.unlockAchievement(93);
          break;
        case 100:
          this.unlockAchievement(111);
          break;
      }
    } else if (stat.name === 'Eggs Hatched (Total)') {
      switch(stat.value) {
        case 50:
          this.unlockAchievement(2);
          break;
        case 100:
          this.unlockAchievement(129);
          break;
        case 500:
          this.unlockAchievement(130);
          break;
        case 1000:
          this.unlockAchievement(131);
          break;
        case 2500:
          this.unlockAchievement(132);
          break;
        case 5000:
          this.unlockAchievement(133);
          break;
      }
    }
    // zoology - 20 (1 of all)
    // 134 = 10
    // 135 = 50
    // 136 = 100

    // 137 - puff
    // old friends - 1
  }

  checkAchievement(id: any): boolean {
    return this.byteBuddies.achievements.findIndex(aid => +aid === +id) > -1;
  }

  unlockAchievement(id: number) {
    if (!this.checkAchievement(id)) {
      this.byteBuddies.achievements.push(id);
      const chievo = this.allAchievements.find(a => +a.ID === +id)
      this.toasts.push({ severity: 'info', summary: 'Achievement Unlocked', detail: chievo.name2 });

      if (chievo.byteReward) {
        this.byteBuddies.byteCoins += +chievo.byteReward;
      }
      if (chievo.goldReward) {
        this.byteBuddies.goldenBits += +chievo.goldReward;
      }
    }
  }

}
