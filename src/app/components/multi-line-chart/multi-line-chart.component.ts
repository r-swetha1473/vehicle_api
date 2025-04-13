import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #chart></div>
    <div id="toggle-container" style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;"></div>
    <div id="safety-status" style="text-align: center; font-size: 18px; font-weight: bold; margin-top: 20px;"></div>
  `,
  styleUrls: ['./multi-line-chart.component.css']
})
export class MultiLineChartComponent implements AfterViewInit {
  @ViewChild('chart', { static: false }) chartContainer!: ElementRef;
  private svg!: d3.Selection<SVGGElement, unknown, null, undefined>;

  ngAfterViewInit() {
    this.loadData();
  }

  private async loadData() {
    try {
      const response = await fetch('https://vin-tyn8.onrender.com/get-acceleration-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: "VIN1001" })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const jsonData = await response.json();
      if (jsonData && jsonData.data) {
        const formattedData = this.formatData(jsonData.data);
        this.createChart(formattedData);
        this.evaluateSafety(formattedData);
      } else {
        console.error('Invalid JSON format', jsonData);
      }
    } catch (error) {
      console.error('Error fetching API data:', error);
    }
  }

  private formatData(apiData: any[]) {
    const threeMonthsAgo = d3.timeMonth.offset(new Date(), -3); // Get the date 3 months ago
  
    return apiData
      .map(d => {
        const parsedDate = d3.timeParse('%Y-%m-%d')(d.date);
        return parsedDate && parsedDate >= threeMonthsAgo
          ? { date: parsedDate, xAcc: +d['X-acc'], yAcc: +d['Y-acc'], gForce: +d['G-Force'] }
          : null;
      })
      .filter(d => d !== null);
  }
  

  private getColor(value: number, type: string): string {
    if (type === 'gForce') {
      // G-Force: 1.0 to 3.0 indicates aggressive driving behavior
      if (value >= 1.0 && value <= 3.0) return 'red'; // Aggressive driving
      return 'green'; // Normal behavior
    }
  
    if (type === 'xAcc') {
      // X Acceleration: -6.0 to 6.0 (sudden acceleration/braking)
      if (value >= -6.0 && value <= 6.0) return '#FFD700'; // Sudden Acceleration/Braking
      return '#1E3A8A'; // Normal acceleration
    }
  
    if (type === 'yAcc') {
      // Y Acceleration: -6.0 to 6.0 (sharp turns)
      if (value >= -6.0 && value <= 6.0) return '#FF7300'; // Sharp turns
      return '#007BFF'; // Normal lane movement
    }
  
    return 'black'; // Default color
  }
  

  private createChart(data: { date: Date; xAcc: number; yAcc: number; gForce: number }[]) {
    const width = 500, height = 500, margin = { top: 50, right: 50, bottom: 100, left: 60 };
    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
  
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width - margin.left - margin.right]);
  
    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.xAcc, d.yAcc, d.gForce))! * 1.2,
        d3.max(data, d => Math.max(d.xAcc, d.yAcc, d.gForce))! * 1.2
      ])
      .range([height - margin.top - margin.bottom, 0]);
  
    this.svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(d3.timeWeek.every(2)).tickFormat(d => d3.timeFormat('%b %d')(d as Date)));
  
    this.svg.append('g')
      .call(d3.axisLeft(y));
  
    // ✅ Add Tooltip
    const tooltip = d3.select(this.chartContainer.nativeElement)
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('border', '1px solid #ccc')
      .style('pointer-events', 'none')
      .style('opacity', 0);
  
    const drawVariableColorLine = (key: 'gForce' | 'xAcc' | 'yAcc') => {
      const processedData = data.map(d => ({ date: d.date, value: d[key] }));
  
      const lineSegments = this.svg.append('g').attr('id', `line-${key}`);
  
      processedData.forEach((d, i) => {
        if (i > 0) {
          const lineColor = this.getColor(d.value, key);
          const safetyStatus = this.getSafetyStatus(d.value, key); // ✅ Get Safe/Dangerous Status
  
          lineSegments.append('line')
            .attr('x1', x(processedData[i - 1].date))
            .attr('y1', y(processedData[i - 1].value))
            .attr('x2', x(d.date))
            .attr('y2', y(d.value))
            .attr('stroke', lineColor)
            .attr('stroke-width', 2.5)
            .on('mouseover', (event) => {
              tooltip.style('opacity', 1)
                .html(`
                  <strong>${key.toUpperCase()}</strong> <br/>
                  <strong>Date:</strong> ${d3.timeFormat('%b %d, %Y')(d.date)} <br/>
                  <strong>Value:</strong> ${d.value.toFixed(2)} <br/>
                  <strong>Status:</strong> ${safetyStatus}
                `)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 20}px`)
                .style('color', safetyStatus === 'Safe' ? 'green' : 'red');
            })
            .on('mouseout', () => tooltip.style('opacity', 0));
        }
      });
    };
  
    drawVariableColorLine('gForce');
    drawVariableColorLine('xAcc');
    drawVariableColorLine('yAcc');
  
    this.createCheckboxes();
  }
  
  private getSafetyStatus(value: number, type: string): string {
    if (type === 'gForce' && value >= 1.0 && value <= 3.0) return 'Dangerous';
    if (type === 'xAcc' && (value >= -6.0 && value <= 6.0)) return 'Dangerous';
    if (type === 'yAcc' && (value >= -6.0 && value <= 6.0)) return 'Dangerous';
    return 'Safe';
  }
  

  private createCheckboxes() {
    const toggleContainer = d3.select("#toggle-container");
    toggleContainer.selectAll('*').remove(); // Clear old checkboxes

    const metrics = ['gForce', 'xAcc', 'yAcc'];

    metrics.forEach(key => {
      const toggleDiv = toggleContainer.append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('gap', '5px');

      const checkbox = toggleDiv.append('input')
        .attr('type', 'checkbox')
        .attr('id', `checkbox-${key}`)
        .property('checked', true)
        .on('change', function () {
          const isChecked = (this as HTMLInputElement).checked;
          d3.select(`#line-${key}`).transition().duration(300).style('opacity', isChecked ? 1 : 0);
        });

      toggleDiv.append('label')
        .attr('for', `checkbox-${key}`)
        .text(key)
        .style('color', 'black')
        .style('font-weight', 'bold');
    });
    
  }
  private evaluateSafety(data: { gForce: number; xAcc: number; yAcc: number }[]) {
    let isSafe = data.every(d => 
      (d.gForce < 1.0 || d.gForce > 3.0) &&
      (d.xAcc < -6.0 || d.xAcc > 6.0) &&
      (d.yAcc < -6.0 || d.yAcc > 6.0)
    );
    
    d3.select("#safety-status")
      .text(isSafe ? "Vehicle Status: SAFE" : "Vehicle Status: DANGEROUS")
      .style("color", isSafe ? "green" : "red");
  }
}
