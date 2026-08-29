# Arreglar el error al crear partidos

## Qué está pasando

Al guardar un partido (tanto en "Nuevo partido" como en "Jornada completa"), la base de datos
dispara el recálculo automático de la tabla de posiciones, y ese recálculo tiene una consulta mal
formada. Devuelve `invalid reference to FROM-clause entry for table "s"` y por eso el guardado se
cancela por completo: hoy no hay ningún partido registrado.

No es un problema de permisos ni de tu cuenta: tu usuario tiene rol de administrador y la tabla de
partidos tiene los permisos correctos.

## Qué se va a hacer

1. Corregir la función de recálculo de posiciones para que su consulta sea válida, conservando la
   lógica actual tal cual: partidos jugados, ganados, empatados, perdidos, goles a favor y en contra,
   diferencia, puntos (incluyendo el ajuste manual) y la racha de los últimos 5 resultados.
2. Verificar después del arreglo que un partido se guarda correctamente y que la tabla de posiciones
   se actualiza sola, incluyendo el caso de partidos entre grupos distintos (cada equipo suma en su
   propio grupo).

## Detalle técnico

La función `recalculate_standings(_season)` hace:

```text
UPDATE league_standings s
   SET ...
  FROM (SELECT 1) dummy
  LEFT JOIN agg a ON a.team_id = s.team_id   -- inválido: "s" no es visible aquí
```

Postgres no permite referenciar la tabla del `UPDATE` dentro de un `JOIN` de la cláusula `FROM`. Se
reemplaza por una versión equivalente sin ese truco: los CTEs `sides`, `agg` y `formed` se mantienen,
y el `UPDATE` se hace con subconsultas correlacionadas (`(SELECT ... FROM agg a WHERE a.team_id =
s.team_id)`) o con un `FROM` sobre la unión de equipos con sus agregados, usando `COALESCE` para los
equipos sin partidos jugados. Se aplica como migración con `CREATE OR REPLACE FUNCTION`, sin tocar
tablas, triggers ni políticas.
