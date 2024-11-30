import { Component } from '@angular/core';
import { DashboardService } from '../_services/dashboard.service';
import { Subject, finalize } from 'rxjs';
import { UserService } from '../_services/user.service';
import { EventService } from '../_services/event.service';
import { ActivatedRoute } from '@angular/router';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { LegendOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  loading: boolean = false;
  chart: any = [];
  user: any;
  stats: any;
  $destroyWatching: Subject<any> = new Subject();
  selectedChatbot: any;
  id: string | null = null;
  trainingPercentage: number = 0;
  trainingChartData: any[] = [];
  intentsChartData: any[] = [];
  recognitionChartData: any[] = [];
  // view: [number, number] = [300, 700];

  // chart options
  gradient: boolean = true;
  showLegendPie: boolean = false;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showXAxisLabel: boolean = true;
  yAxisLabel: string = 'Intents';
  showYAxisLabel: boolean = true;
  xAxisLabel: string = 'Values';
  legendPosition: LegendPosition = LegendPosition.Right;
  activeItem: string = '7'; // Default active item

  customColorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5DD89D', '#072032', '#FFF59F', '#89FFBA', '#6BE3AA'],
  };
  customColorSchemeBar: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5DD89D', '#072032', '#FFF59F', '#89FFBA', '#6BE3AA'],
  };

  constructor(
    private dashboardService: DashboardService,
    private userService: UserService,
    private eventService: EventService<any>,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.userService.getUserDetails();
    this.route.queryParams.subscribe((params) => {
      this.id = params['id'];
      this.getStats();
    });
  }

  getStats() {
    this.loading = true;
    this.dashboardService
      .getStats(this.id as string, Number(this.activeItem))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        console.log(res);
        this.stats = res.data;
        this.setChartData();
      });
  }

  // charts events
  onSelect(data: any): void {
    // console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    // console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  setChartData() {
    if (this.stats?.trainingFiles) {
      this.trainingPercentage = (this.stats?.trainingFiles / 500) * 100;
      this.trainingChartData = [
        {
          name: 'Achieved',
          value: this.stats?.trainingFiles,
        },
        {
          name: 'Remaining',
          value: 500 - this.stats?.trainingFiles,
        },
      ];
    }
    if (this.stats?.topIntents) {
      for (var key of Object.keys(this.stats.topIntents)) {
        this.intentsChartData.push({
          name: key,
          value: Number(this.stats.topIntents[key]),
        });
      }
    }
    if (this.stats?.recognitionRate?.data?.datasets?.length) {
      this.stats.recognitionRate.data.datasets[0].data.forEach((data: any) => {
        this.recognitionChartData.push({
          name: data.id,
          value: Number(data.nested.value),
        });
      });
    }
  }

  // for static value bind
  setActive(item: string): void {
    this.activeItem = item;

    const intentsChartNames = this.intentsChartData.map((x) => x.name);
    const recognitionChartNames = this.recognitionChartData.map((x) => x.name);
    this.intentsChartData = [];
    this.recognitionChartData = [];

    intentsChartNames.forEach((intent: any) => {
      this.intentsChartData.push({
        name: intent,
        value: Math.floor(Math.random() * (100 - 10 + 1)) + 10,
      });
    });

    recognitionChartNames.forEach((rec: any) => {
      this.recognitionChartData.push({
        name: rec,
        value: Math.floor(Math.random() * (100 - 10 + 1)) + 10,
      });
    });
  }

  // Doughnut
  public doughnutChartLabels: string[] = [
    'Download Sales',
    'In-Store Sales',
    'Mail-Order Sales',
  ];
}
