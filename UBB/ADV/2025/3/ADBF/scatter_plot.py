import pandas as pd
import plotly.express as px

# Read the data (assuming it's in the same format as your original visualization)
df2 = pd.read_csv('data.csv')  # Make sure to put your data.csv in the same directory

# Create an interactive connected scatter plot using Plotly
fig = px.scatter(df2, 
                x='population',
                y='gdp_per_capita',
                color='inflation_rate',
                symbol='country',
                title='Population vs GDP per Capita Over Time (2004-2023)',
                labels={'population': 'Population',
                        'gdp_per_capita': 'GDP per Capita',
                        'inflation_rate': 'Inflation Rate'},
                hover_data=['country', 'year', 'population', 'gdp_per_capita', 'inflation_rate'])

# Add lines connecting points for each country
for country in df2['country'].unique():
    country_data = df2[df2['country'] == country].sort_values('year')
    fig.add_scatter(x=country_data['population'],
                   y=country_data['gdp_per_capita'],
                   mode='lines',
                   line=dict(width=1),
                   showlegend=False,
                   hoverinfo='skip')

# Update layout
fig.update_layout(
    width=800,
    height=600,
    template='plotly_white'
)

# Save as standalone HTML file
fig.write_html('scatter_plot.html') 