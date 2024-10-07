from flask import Flask, render_template, request, jsonify
import pyodbc
from langchain_community.llms import Ollama
 
app = Flask(__name__)
 
# Configuración del modelo Llama 3.2
llm = Ollama(model="llama3.2", temperature=0.1)
 
def generar_consulta_sql(pregunta):
    # Palabras clave que pueden indicar que la pregunta está relacionada con la consulta DPI
    palabras_clave_dpi = ["fecha", "nro telefono", "hora", "megabytes", "servicio" ,"linea" ,"telefono" , "megas" , "trafico"]
 
    # Convertir la pregunta a minúsculas y verificar si contiene palabras clave
    if any(palabra in pregunta.lower() for palabra in palabras_clave_dpi):
        print("PROCESANDO RESPUESTA...")  # Mensaje de procesamiento
        prompt = f"""
        A partir de la pregunta del usuario, genera una consulta SQL válida para Netezza IBM que pueda ejecutarse sobre la consulta_DPI y no debes de salir de estas a.fecha BETWEEN to_date('01/08/2024','dd/mm/yyyy')  AND to_date('31/10/2024','dd/mm/yyyy') .
        La consulta debe estar relacionada a la siguiente estructura:
       
        consulta_DPI:
        select
        a.FECHA,
        a.NRO_TELEFONO TELEFONO, -- este campo se lo conoce como teléfono o línea y es de 8 dígitos
        a.HORA, -- es la hora del día
        sum(a.down+a.up)/1000/1000 MB, -- son los megas navegados
        b.SERVICEID SERVICIO -- muestra los servicios como 'Facebook Chat'
        from
        PR_DPI.MODELO.AGG_NRO_DIA_DPI a,
        PR_DPI.MODELO.DIM_APP_DPI b
        where
        a.fecha BETWEEN to_date('01/08/2024','dd/mm/yyyy')  AND to_date('31/10/2024','dd/mm/yyyy')
        and a.idw_tipo_cdr_dpi=1
        and a.idw_app_dpi=b.idw_app_dpi
        group by  
        a.FECHA,
        a.NRO_TELEFONO,
        a.HORA,
        b.SERVICEID
        order by
        sum(a.down+a.up)/1000/1000
        limit 100
        Pregunta: {pregunta}
 
        Respuesta: Solo devuelve la consulta SQL sin ningún comentario ni texto adicional.
        """
        consulta_sql = llm.invoke(prompt)
 
        # Limpiar la consulta para quitar cualquier bloque de código o texto adicional
        consulta_sql = consulta_sql.split("Respuesta:")[-1].strip()
 
        # Asegúrate de que la consulta no tenga caracteres de formato
        consulta_sql = consulta_sql.replace("```sql", "").replace("```", "").strip()
 
        return consulta_sql
    else:
        return "Solo respondo consultas relacionadas al DPI."
 
# Función para ejecutar la consulta SQL y obtener resultados desde Netezza
def ejecutar_consulta(consulta):
    try:
        # Conexión a Netezza con pyodbc
        conexion = pyodbc.connect('DRIVER={NetezzaSQL};SERVER=10.49.5.173;UID=U_ETL_PR_REP_OPERATIVOS;PWD=$/etl%pr%rep%operativos;DATABASE=SYSTEM;LoginTimeout=120')
 
        cursor = conexion.cursor()
        cursor.execute(consulta)
        resultados = cursor.fetchall()  # Obtener todos los resultados
        cursor.close()
        conexion.close()
        return resultados
 
    except pyodbc.Error as err:
        print(f"Error: {err}")
        return None
 
@app.route('/')
def index():
    return render_template('index.html')
 
@app.route('/consulta', methods=['POST'])
def consulta():
    data = request.get_json()
    pregunta = data.get('pregunta')
 
    # Generar la consulta SQL
    consulta_sql = generar_consulta_sql(pregunta)
 
    # Mostrar la consulta y la pregunta en la consola
    print(f"Pregunta del usuario: {pregunta}")
    print(f"Consulta SQL generada: {consulta_sql}")
 
    # Ejecutar la consulta
    resultados = ejecutar_consulta(consulta_sql)
 
    # Preparar resultados para el frontend
    if resultados is not None:
        resultados_list = [list(fila) for fila in resultados]
    else:
        resultados_list = []
 
    return jsonify({
        "pregunta": pregunta,
        "consulta_sql": consulta_sql,
        "resultados": resultados_list
    })
 
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5139, debug=True)
 