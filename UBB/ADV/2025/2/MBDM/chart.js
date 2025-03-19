// Sample data for the bar chart
const data = [
  { category: "A", value: 28 },
  { category: "B", value: 55 },
  { category: "C", value: 43 },
  { category: "D", value: 91 },
  { category: "E", value: 81 },
  { category: "F", value: 53 },
  { category: "G", value: 19 },
  { category: "H", value: 87 }
]; //JOA

// Vega-Lite specification for a bar chart
const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  description: "A simple bar chart with categorical data",
  height: 300,
  width: 500,
  data: {
    values: data
  },
  mark: {
    type: "bar"
  },
  encoding: {
    x: {
      field: "category",
      type: "nominal",
      title: ""
    },
    y: {
      field: "value",
      type: "quantitative",
      title: ""
    }
  }
};

// Embed the visualization in the container
vegaEmbed("#vis", spec)