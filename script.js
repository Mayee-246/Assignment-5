fetch("https://disease.sh/v3/covid-19/countries")
  .then(res => res.json())
  .then(data => {
    const top10 = data.sort((a, b) => b.cases - a.cases).slice(0, 10);
    const width = 600, height = 350, margin = 50;

    const svg = d3.select("#numerical").append("svg")
      .attr("width", width).attr("height", height);

    const x = d3.scaleBand()
      .domain(top10.map(d => d.country))
      .range([margin, width - margin])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(top10, d => d.cases)])
      .range([height - margin, margin]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("transform", `translate(${margin},0)`)
      .call(d3.axisLeft(y));

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip").style("display", "none");

    svg.selectAll("rect")
      .data(top10)
      .enter().append("rect")
      .attr("x", d => x(d.country))
      .attr("y", d => y(d.cases))
      .attr("width", x.bandwidth())
      .attr("height", d => height - margin - y(d.cases))
      .attr("fill", "#4287f5")
      .on("mouseover", (event, d) => {
        tooltip.html(`<b>${d.country}</b><br/>Cases: ${d.cases.toLocaleString()}`)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 30 + "px")
          .style("display", "block");
      })
      .on("mousemove", event => {
        tooltip.style("left", event.pageX + "px").style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  });

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(world => {
  const width = 600, height = 350;

  const svg = d3.select("#spatial").append("svg")
    .attr("width", width).attr("height", height);

  const projection = d3.geoMercator().scale(90).translate([width / 2, height / 1.5]);
  const path = d3.geoPath().projection(projection);
  const g = svg.append("g");

  g.selectAll("path")
    .data(world.features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", "#b3e5fc")
    .attr("stroke", "#444");

  svg.call(d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", event => {
      g.attr("transform", event.transform);
    }));
});
fetch("https://www.reddit.com/r/javascript.json")
  .then(res => res.json())
  .then(json => {
    const titles = json.data.children.map(d => d.data.title);
    const words = {};
    titles.forEach(title => {
      title.split(/\s+/).forEach(w => {
        const word = w.toLowerCase().replace(/[^a-z]/g, '');
        if (word && word.length > 3) {
          words[word] = (words[word] || 0) + 1;
        }
      });
    });

    const wordData = Object.entries(words).map(([word, count]) => ({ word, count }));
    renderWordChart(wordData);
  });

function renderWordChart(data) {
  const svgText = d3.select("#textual").append("svg").attr("width", 600).attr("height", 350);
  d3.select("#filterSelect")
    .selectAll("option")
    .data([0, 2, 5, 10])
    .enter().append("option")
    .attr("value", d => d)
    .text(d => d);

  d3.select("#filterSelect").on("change", function () {
    const min = +this.value;
    draw(min);
  });

  function draw(min) {
    svgText.selectAll("*").remove();
  
    const truncate = (word) => word.length > 12 ? word.slice(0, 12) + "…" : word;
  
    const filtered = data
      .filter(d => d.count >= min)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); 
  
    const x = d3.scaleBand()
      .domain(filtered.map(d => truncate(d.word)))
      .range([50, 550])
      .padding(0.2);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d.count)])
      .range([300, 50]);
  
    svgText.append("g")
      .attr("transform", "translate(0,300)")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");
  
    svgText.append("g")
      .attr("transform", "translate(50,0)")
      .call(d3.axisLeft(y));
  
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("display", "none");
  
    svgText.selectAll("rect")
      .data(filtered)
      .enter().append("rect")
      .attr("x", d => x(truncate(d.word)))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => 300 - y(d.count))
      .attr("fill", "#ff9800")
      .on("mouseover", (event, d) => {
        tooltip.html(`<strong>${d.word}</strong><br>Count: ${d.count}`)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 30 + "px")
          .style("display", "block");
      })
      .on("mousemove", event => {
        tooltip.style("left", event.pageX + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  }

    draw(0);
}
