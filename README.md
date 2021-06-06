# adinna101.github.io

# Cíle projektu


  Cílem práce bylo vytvořit hru v jazyce JavaScript s použitím moderních technologií (HTML5, CSS3, JS2015).


# Popis funkčnosti 
  
## Domovská stránka  
  
    Právě se nacházíte na domovské stránce, kde můžete vidět v horní částí nav bar s odkazem na výše zmíněnou hru.
    Dále je zde popis aplikace, který právě čtete a v dolní části jsou dva obrázky, které po najetí myši zobrazí ovládaní a přehrávač se SuperMario soundtrackem 
    (vytvořeno pomocí CSS3 animation a transition). Dále je tato stránka ukládána pomocí JavaScriptu do cache, tudíž je přístupná i v offline stavu.
   

## Stránka se hrou

Na této stránce se nachází pouze hra. Hra je udělána pomocí knihovny KaBoom.js. Tato knihovna byla vytvořena nedávno a je stále vyvíjena, 
ale jelikož autoři slibovali zábavné vytváření her, tak jsem zkusil hru pomocí této knihovny vytvořit.

    

Hra se skládá ze scén, mezi kterými lze přecházet.
První scéna je obrazovka, kde pomocí klávesnice lze napsat vaši herní přezdívku. Poté lze hru spustit pomocí tlačítka ENTER. Hra se ovládá šipkami 
(více infa naleznete u obrázku konzole). Po spuštění hry se načte první level. Obrazovka se skládá z několika vrstev. Uživatelského rozhraní, 
kde je zobrazeno hráčovo jméno, skóre a číslo levelu. Pozadí, což je pozadí a objektové vrsty, kde jsou vykreslovány všechny objekty hry (Mario, monstra, bloky).

Cílem hry je získat, co nejvíce mincí, které vypadávají z označených kostiček. Hra končí, poté co hráč zemře (ať už spadne do hlubin, nebo ho zabije příšera).
Po skonČení hry se zobrazí scéna prohry, na které je zobrazené hráčovo skóre a nejvyšší skóre dosažené na daném počítači (ukládáno do LocalStorage).
