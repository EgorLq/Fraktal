
// Функция вызывается, когда окно полностью загружено
window.onload = function() {
    // Картинка и контекст
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    
    // Ширина и высота изображения
    var imagew = canvas.width;
    var imageh = canvas.height;
    
    // изображения цвета
    var imagedata = context.createImageData(imagew, imageh);
    
    // Параметры панорамирования и масштабирования
    var offsetx = -imagew/2;
    var offsety = -imageh/2;
    var panx = -100;
    var pany = 0;
    var zoom = 150;
    
    // Палитра массива 256 цветов
    var palette = [];
    
    // Максимальное количество итераций на пиксель
    var maxiterations = 250;
    
    // Инициализация процесса
    function init() {
        // добавляем мышь
        canvas.addEventListener("mousedown", onMouseDown);
        
        // генерируем палитру
        generatePalette();
        
        // генерируем изображения
        generateImage();
    
        // входим в основной цикл
        main(0);
    }
    
    // основной цикл
    function main(tframe) {
        // реквест кадров анимации
        window.requestAnimationFrame(main);
        
        // рисуем сгенирированое изображения
        context.putImageData(imagedata, 0, 0);
    }
    
    //  генерируем палитру
    function generatePalette() {
        // высчитываем градиент
        var roffset = 24;
        var goffset = 16;
        var boffset = 0;
        for (var i=0; i<256; i++) {
            palette[i] = { r:roffset, g:goffset, b:boffset};
            
            if (i < 64) {
                roffset += 3;
            } else if (i<128) {
                goffset += 3;
            } else if (i<192) {
                boffset += 3;
            }
        }
    }
    
    // генерируем фрактальное изображения
    function generateImage() {
        // итерация по пикселям
        for (var y=0; y<imageh; y++) {
            for (var x=0; x<imagew; x++) {
                iterate(x, y, maxiterations);
            }
        }
    }

    //  цвета конкретных пикселей
    function iterate(x, y, maxiterations) {
        // преобразуем в фрактальную кординату
        var x0 = (x + offsetx + panx) / zoom;
        var y0 = (y + offsety + pany) / zoom;
        
        // Переменные итерации
        var a = 0;
        var b = 0;
        var rx = 0;
        var ry = 0;
        
        // итерации
        var iterations = 0;
        while (iterations < maxiterations && (rx * rx + ry * ry <= 4)) {
            rx = a * a - b * b + x0;
            ry = 2 * a * b + y0;
            
            // следующие итерации
            a = rx;
            b = ry;
            iterations++;
        }
        
        // Получаем цвет палитры в зависимости от количества итераций
        var color;
        if (iterations == maxiterations) {
            color = { r:0, g:0, b:0}; // Black
        } else {
            var index = Math.floor((iterations / (maxiterations-1)) * 255);
            color = palette[index];
        }
        
        // выбираем цвет
        var pixelindex = (y * imagew + x) * 4;
        imagedata.data[pixelindex] = color.r;
        imagedata.data[pixelindex+1] = color.g;
        imagedata.data[pixelindex+2] = color.b;
        imagedata.data[pixelindex+3] = 255;
    }
    
    // изображения фрактала 
    function zoomFractal(x, y, factor, zoomin) {
        if (zoomin) {
            // Приблизить
            zoom *= factor;
            panx = factor * (x + offsetx + panx);
            pany = factor * (y + offsety + pany);
        } else {
            // отдалить
            zoom /= factor;
            panx = (x + offsetx + panx) / factor;
            pany = (y + offsety + pany) / factor;
        }
    }
    
    // обработка кликов мышки
    function onMouseDown(e) {
        var pos = getMousePos(canvas, e);
        
        // отдалить с помошью контрола
        var zoomin = true;
        if (e.ctrlKey) {
            zoomin = false;
        }
        
        // перемещать с шифтом
        var zoomfactor = 2;
        if (e.shiftKey) {
            zoomfactor = 1;
        }
        
        // клик мыши увеличивает размер
        zoomFractal(pos.x, pos.y, zoomfactor, zoomin);
        
        // генерация нового изображения
        generateImage();
    }
    
    //получаем позицию мыши 
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }
    
    // Вызывов начала инита 
    init();
};