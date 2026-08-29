import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
///LA GRÁFICA QUE GENERA ESTA CONFIGURADA SOLAMENTE PARA LA PÁGINA DE INICIO
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
/**
 * Método para generar gráfica de barras
 * @param {*} dom elemento del dom donde se mostrará la gráfica
 * @param {*} titulo titulo de la gráfica
 * @param {*} x nombres de los elementos de la gráfica
 * @param {*} y valores que tiene cada elemento de la gráfica
 */
export const graficaBarra = (dom, titulo, x, y) => {
    
    let data = {
        labels: x,
        datasets: [{
            label: titulo,
            backgroundColor: getColors(95),
            borderColor: getColors(),
            data: y,
            borderWidth: 1,
            barThickness: 70,
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
                        display: false,
                        offset: true
                    },
                
                }
            },
            plugins:{
                title:{
                    display: false//modificable
                },
                legend: {
                    display: false,//modificable
                    position: 'top'
                },
                tooltip:{
                    enabled: false
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
