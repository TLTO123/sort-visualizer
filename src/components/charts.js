import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale, 
  Title,
  Tooltip,
  Legend
);
let bar

export const graficaBarra = (dom, titulo, x, y) => {
    
    let data = {
        labels: x,
        datasets: [{
            label: titulo,
            backgroundColor: getColors(95),
            borderColor: getColors(),
            data: y,
            borderWidth: 1
        }]
    };

    let config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            scales:{
                y:{
                    beginAtZero: true,
                    
                    grid:{//modicable
                        display: false
                    },
                    display: false,//modificable
                },
                x: {
                    grid:{
                        display: false
                    }
                }
            },
            plugins:{
                title:{
                    display: false//modificable
                },
                legend: {
                    display: false,//modificable
                    position: 'top'
                }
            }
        }   
    }

    if(document.getElementById(dom).$chartjs){
        bar.destroy()
    }
    bar = new Chart(document.getElementById(dom), config)
}

const getColors = (opacity) => {
    // definiendo colores para poder ponerle a la gráfica
    const colors = ['#19356C'];
    return colors.map(color => opacity ? `${color + opacity}` : color)
}
