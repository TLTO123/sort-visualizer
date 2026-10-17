// ============================================================
// ARCHIVO: algorithms/generadores.js
// RESPONSABLE: LÓGICA pura de los 4 algoritmos de ordenamiento
// USADO POR: Rendimiento.vue (los 4 en paralelo) y OrdenarMiLista.vue (1 a elección)
//            — este módulo es la fuente única de verdad: NO hay copias en las vistas.
//
// PROTOCOLO (contrato entre este módulo y las vistas):
//   - Cada función es un GENERADOR (function*): no ejecuta hasta que la vista
//     llama a .next() en su bucle de animación.
//   - Cada yield devuelve { arr: [...], finalizado?: true }
//       · arr → COPIA SUPERFICIAL del arreglo para dibujar esa "fotograma"
//       · finalizado → bandera única del último paso (fin de la ejecución)
//   - Elementos del arreglo: { id, valor, estado }
//       · estado ∈ 'default' | 'comparando' | 'minimo' | 'ordenado'
//       · el estado es lo único que cambia el COLOR de la barra (ver renderizarBarras.js)
//
// SEPARACIÓN DE CAPAS: este archivo NO dibuja ni usa timers/DOM — solo calcula.
// ============================================================

// Funciones que ejecutan los métodos de ordenamiento
// --- MÉTODO BURBUJA BIDIRECCIONAL (BUBBLE SORT) ---
export function* bubbleSortGenerador(arreglo) {
  let arr = arreglo.map(d => ({ ...d, estado: 'default' }));
  let n = arr.length;
  let huboIntercambio = true;
  let inicio = 0;
  let fin = n - 1;

  while (huboIntercambio) {
    huboIntercambio = false;

    // 1. Recorrido de izquierda a derecha (empuja el mayor al final)
    for (let i = inicio; i < fin; i++) {
      arr[i].estado = 'comparando';
      arr[i + 1].estado = 'comparando';
      yield { arr: [...arr] };

      if (arr[i].valor > arr[i + 1].valor) {
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        huboIntercambio = true;
        yield { arr: [...arr] };
      }

      arr[i].estado = 'default';
      arr[i + 1].estado = 'default';
    }

    // El último elemento recorrido ya está en su posición final
    arr[fin].estado = 'ordenado';
    yield { arr: [...arr] };

    // Si no hubo intercambios en la ida, ya está ordenado
    if (!huboIntercambio) break;

    huboIntercambio = false;
    fin--; // El límite derecho se reduce

    // 2. Recorrido de derecha a izquierda (empuja el menor al principio)
    for (let i = fin - 1; i >= inicio; i--) {
      arr[i].estado = 'comparando';
      arr[i + 1].estado = 'comparando';
      yield { arr: [...arr] };

      if (arr[i].valor > arr[i + 1].valor) {
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        huboIntercambio = true;
        yield { arr: [...arr] };
      }

      arr[i].estado = 'default';
      arr[i + 1].estado = 'default';
    }

    // El primer elemento recorrido ya está en su posición final
    arr[inicio].estado = 'ordenado';
    yield { arr: [...arr] };

    inicio++; // El límite izquierdo avanza
  }

  // Asegurar que todos queden marcados como ordenados al final
  arr.forEach(d => d.estado = 'ordenado');
  yield { arr: [...arr], finalizado: true };
}

// --- MÉTODO SELECCIÓN (SELECTION SORT) ---
export function* selectionSortGenerador(arreglo) {
  let arr = arreglo.map(d => ({ ...d, estado: 'default' }));
  let n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    arr[minIdx].estado = 'minimo';
    yield { arr: [...arr] }; // Renderiza el azul

    for (let j = i + 1; j < n; j++) {
      arr[j].estado = 'comparando';
      yield { arr: [...arr] }; // Renderiza el rosa temporalmente

      if (arr[j].valor < arr[minIdx].valor) {
        arr[minIdx].estado = 'default';
        minIdx = j;
        arr[minIdx].estado = 'minimo'; // Nuevo azul
        yield { arr: [...arr] };
      } else {
        arr[j].estado = 'default';
      }
    }

    if (minIdx !== i) {
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      yield { arr: [...arr] }; // Anima el intercambio
    }
    arr[i].estado = 'ordenado';
  }
  arr[n - 1].estado = 'ordenado';
  yield { arr: [...arr], finalizado: true };
}

// --- MÉTODO INSERCIÓN (INSERTION SORT) ---
export function* insertionSortGenerador(arreglo) {
  let arr = arreglo.map(d => ({ ...d, estado: 'default' }));
  let n = arr.length;

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;

    // Resaltar el elemento que se va a insertar
    key.estado = 'minimo';
    yield { arr: [...arr] };

    while (j >= 0 && arr[j].valor > key.valor) {
      arr[j + 1].estado = 'comparando';
      yield { arr: [...arr] };

      arr[j + 1] = arr[j];
      j = j - 1;
      yield { arr: [...arr] };
    }

    arr[j + 1] = key;

    // Marcar progresivamente los elementos ya recorridos como ordenados hasta la posición i
    for (let k = 0; k <= i; k++) {
      arr[k].estado = 'ordenado';
    }
    yield { arr: [...arr] };
  }

  // Marcar todos como ordenados al finalizar
  arr.forEach(d => d.estado = 'ordenado');
  yield { arr: [...arr], finalizado: true };
}

// --- MÉTODO QUICKSORT (QUICK SORT) ---
export function* quickSortGenerador(arreglo) {
  let arr = arreglo.map(d => ({ ...d, estado: 'default' }));

  // Función partición interna
  function* particion(low, high) {
    let pivotIdx = high;
    arr[pivotIdx].estado = 'minimo'; // El pivote se pinta azul
    yield { arr: [...arr] };

    let i = low - 1;
    for (let j = low; j < high; j++) {
      arr[j].estado = 'comparando';
      yield { arr: [...arr] };

      if (arr[j].valor < arr[pivotIdx].valor) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        yield { arr: [...arr] };
      }
      arr[j].estado = 'default';
    }

    // Colocar el pivote en su posición final
    i++;
    let temp = arr[i];
    arr[i] = arr[pivotIdx];
    arr[pivotIdx] = temp;

    arr[i].estado = 'ordenado'; // Este pivote ya encontró su lugar final
    yield { arr: [...arr] };
    return i;
  }

  // Función recursiva interna. Usamos yield* para delegar el control
  function* quickSortHelper(low, high) {
    if (low < high) {
      let pi = yield* particion(low, high);
      yield* quickSortHelper(low, pi - 1);
      yield* quickSortHelper(pi + 1, high);
    } else if (low === high) {
      arr[low].estado = 'ordenado';
      yield { arr: [...arr] };
    }
  }

  yield* quickSortHelper(0, arr.length - 1);

  // Seguro final: forzar que todo se pinte como ordenado
  arr.forEach(d => d.estado = 'ordenado');
  yield { arr: [...arr], finalizado: true };
}