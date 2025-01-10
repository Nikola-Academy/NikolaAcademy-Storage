/**
 * Save data to flash storage
 */
//% block="Data Storage"
//% icon="\uf468"
//% color="#22ABB2"
namespace datastorage {
    export enum DeleteType {
        //% block="fast"
        Fast,
        //% block="full"
        Full
    }

    let onStorageFullHandler: () => void;
    let _disabled = false;

    let initialized = false;
    function init() {
        if (initialized)
            return;
        initialized = true;

        includeTimestamp(FlashLogTimeStampFormat.None);
        mirrorToSerial(false);

        control.onEvent(DAL.MICROBIT_ID_LOG, DAL.MICROBIT_LOG_EVT_LOG_FULL, () => {
            _disabled = true;
            if (onStorageFullHandler) {
                onStorageFullHandler();
            } else {
                basic.showLeds(`
                    . # . # .
                    # # # # #
                    . # . # .
                    # # # # #
                    . # . # .
                `);
                basic.pause(1000);
                basic.clearScreen();
                basic.showString("rA9");
            }
        });
    }


    export class ColumnValue {
        public value: string;
        constructor(
            public column: string,
            value: any
        ) {
            this.value = "" + value;
        }
    }

    /**
     * A column and value to log to flash storage
     * @param column the column to set
     * @param value the value to set.
     * @returns A new value that can be stored in flash storage using log data
     */
    //% block="column $column value $value"
    //% value.shadow=math_number
    //% column.shadow=datalogger_columnfield
    //% blockId=dataloggercreatecolumnvalue
    //% group="micro:bit (V2)"
    //% blockHidden=true
    //% weight=80 help=datalogger/create-cv
    export function createCV(column: string, value: any): ColumnValue {
        return new ColumnValue(column, value);
    }

    //% block="$column"
    //% blockId=datalogger_columnfield
    //% group="micro:bit (V2)"
    //% blockHidden=true shim=TD_ID
    //% column.fieldEditor="autocomplete" column.fieldOptions.decompileLiterals=true
    //% column.fieldOptions.key="dataloggercolumn"
    export function _columnField(column: string) {
        return column
    }

    /**
     * Save data to long term Micro:bit storage
     * @param variableName variable name to be stored to flash storage
     * @param value variable name to be stored to flash storage
     */
    //% block="set $variableName in storage to $value"
    //% blockId=dataloggerlogdata
    //% data.shadow=lists_create_with
    //% data.defl=dataloggercreatecolumnvalue
    //% group="micro:bit (V2)"
    //% weight=100
    export function saveData(variableName: string, value: any): void {
        if (_disabled) return;
        if (!variableName || value === undefined) return;

        init();

        let data: ColumnValue[] = [];
        let columnNames = flashlog.getRows(1, 1);

        if (columnNames.length != 0) {
            // Storage has existing data
            let columnList: string[] = columnNames.split(",");
            let existingData = flashlog.getRows(1, 2).split(",");

            // Create new data array with all existing columns and values
            for (let i = 0; i < columnList.length; i++) {
                let col = columnList[i];
                let val = (col === variableName) ? value : existingData[i];
                data.push(createCV(col, val));
            }

            // If variable name doesn't exist in columns, add it
            if (columnList.indexOf(variableName) === -1) {
                data.push(createCV(variableName, value));
            }
        } else {
            // Storage is empty, create new entry
            data = [createCV(variableName, value)];
        }
        
        // Clear existing data and write new data
        deleteLog();
        
        flashlog.beginRow();
        for (const cv of data) {
            flashlog.logData(cv.column, cv.value);
        }
        flashlog.endRow();
    }

    /**
     * Log data to flash storage
     * @param data Array of data to be logged to flash storage
     */
    //% block="set data array $data"
    //% blockId=dataloggerlogdata
    //% data.shadow=lists_create_with
    //% data.defl=dataloggercreatecolumnvalue
    //% group="micro:bit (V2)"
    //% blockHidden=true
    //% weight=100
    export function logData(data: ColumnValue[]): void {
        if (!data || !data.length)
            return;
        init();

        if (_disabled)
            return;

        flashlog.beginRow();
        for (const cv of data) {
            flashlog.logData(cv.column, cv.value);
        }
        flashlog.endRow();
    }
    

    /**
     * Log data to flash storage
     * @param data1 First column and value to be logged
     * @param data2 [optional] second column and value to be logged
     * @param data3 [optional] third column and value to be logged
     * @param data4 [optional] fourth column and value to be logged
     * @param data5 [optional] fifth column and value to be logged
     * @param data6 [optional] sixth column and value to be logged
     * @param data7 [optional] seventh column and value to be logged
     * @param data8 [optional] eighth column and value to be logged
     * @param data9 [optional] ninth column and value to be logged
     */
    //% block="log data $data1||$data2 $data3 $data4 $data5 $data6 $data7 $data8 $data9 $data10"
    //% blockId=dataloggerlog
    //% data1.shadow=dataloggercreatecolumnvalue
    //% data2.shadow=dataloggercreatecolumnvalue
    //% data3.shadow=dataloggercreatecolumnvalue
    //% data4.shadow=dataloggercreatecolumnvalue
    //% data5.shadow=dataloggercreatecolumnvalue
    //% data6.shadow=dataloggercreatecolumnvalue
    //% data7.shadow=dataloggercreatecolumnvalue
    //% data8.shadow=dataloggercreatecolumnvalue
    //% data9.shadow=dataloggercreatecolumnvalue
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% group="micro:bit (V2)"
    //% blockHidden=true
    //% weight=100 help=datalogger/log
    export function log(
        data1: datastorage.ColumnValue,
        data2?: datastorage.ColumnValue,
        data3?: datastorage.ColumnValue,
        data4?: datastorage.ColumnValue,
        data5?: datastorage.ColumnValue,
        data6?: datastorage.ColumnValue,
        data7?: datastorage.ColumnValue,
        data8?: datastorage.ColumnValue,
        data9?: datastorage.ColumnValue,
    ): void {
        logData(
            [
                data1,
                data2,
                data3,
                data4,
                data5,
                data6,
                data7,
                data8,
                data9,
            ].filter(el => !!el)
        );
    }



    /**
     * Set the columns for future data logging
     * @param cols Array of the columns that will be logged.
     */
    //% block="set columns $cols"
    //% blockId=dataloggersetcolumns
    //% data.shadow=list_create_with
    //% data.defl=datalogger_columnfield
    //% group="micro:bit (V2)"
    //% blockHidden=true
    //% weight=70
    export function setColumns(cols: string[]): void {
        if (!cols)
            return;

        logData(cols.map(col => createCV(col, "")));
    }

    /**
     * Set the columns for future data logging
     * @param col1 Title for first column to be added
     * @param col2 Title for second column to be added
     * @param col3 Title for third column to be added
     * @param col4 Title for fourth column to be added
     * @param col5 Title for fifth column to be added
     * @param col6 Title for sixth column to be added
     * @param col7 Title for seventh column to be added
     * @param col8 Title for eighth column to be added
     * @param col9 Title for ninth column to be added
     */
    //% block="set columns $col1||$col2 $col3 $col4 $col5 $col6 $col7 $col8 $col9 $col10"
    //% blockId=dataloggersetcolumntitles
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% group="micro:bit (V2)"
    //% blockHidden=true
    //% weight=70 help=datalogger/set-column-titles
    //% col1.shadow=datalogger_columnfield
    //% col2.shadow=datalogger_columnfield
    //% col3.shadow=datalogger_columnfield
    //% col4.shadow=datalogger_columnfield
    //% col5.shadow=datalogger_columnfield
    //% col6.shadow=datalogger_columnfield
    //% col7.shadow=datalogger_columnfield
    //% col8.shadow=datalogger_columnfield
    //% col9.shadow=datalogger_columnfield
    export function setColumnTitles(
        col1: string,
        col2?: string,
        col3?: string,
        col4?: string,
        col5?: string,
        col6?: string,
        col7?: string,
        col8?: string,
        col9?: string,
    ): void {
        logData(
            [col1, col2, col3, col4, col5, col6, col7, col8, col9]
                .filter(el => !!el)
                .map(col => createCV(col, ""))
        );
    }

    /**
     * Delete all existing stored variable.
     */
    //% block="delete storage"
    //% blockId=dataloggerdeletelog
    //% group="micro:bit (V2)"
    //% weight=97 help=datalogger/delete-log
    export function deleteLog(): void {
        init();
        flashlog.clear(true); //false:fast, true:full
    }

    /**
     * Register an event to run when no more data can be logged.
     * @param handler code to run when the log is full and no more data can be stored.
     */
    //% block="on log full"
    //% blockId="on log full"
    //% group="micro:bit (V2)"
    //% blockHidden=true
    //% weight=40 help=datalogger/on-log-full
    export function onLogFull(handler: () => void): void {
        init();
        onStorageFullHandler = handler;
    }

    /**
     * Set the format for timestamps
     * @param format Format in which to show the timestamp. Setting FlashLogTimeStampFormat.None will disable the timestamp.
     */
    //% block="set timestamp $format"
    //% blockId=dataloggertoggleincludetimestamp
    //% format.defl=FlashLogTimeStampFormat.None
    //% group="micro:bit (V2)"
    //% blockHidden=true
    //% weight=30 help=datalogger/include-timestamp
    export function includeTimestamp(format: FlashLogTimeStampFormat): void {
        init();
        flashlog.setTimeStamp(format);
    }

    /**
     * Set whether data is mirrored to serial or not.
     * @param on if true, data that is logged will be mirrored to serial
     */
    //% block="mirror data to serial $on"
    //% blockId=dataloggertogglemirrortoserial
    //% on.shadow=toggleOnOff
    //% on.defl=false
    //% blockHidden=true
    //% weight=25 help=datalogger/mirror-to-serial
    export function mirrorToSerial(on: boolean): void {
        // TODO:/note intentionally does not have group, as having the same group for all
        // blocks in a category causes the group to be elided.
        init();
        flashlog.setSerialMirroring(on);
    }

  /**
   * Number of rows currently used by the datalogger, start counting at fromRowIndex
   * Treats the header as the first row
   * @param fromRowIndex 0-based index of start
   * @returns header + rows
   */
  //% block="get number row $fromRowIndex"
  //% fromRowIndex.shadow=math_number
  //% blockId=dataloggergetnumberofrows
  //% group="micro:bit (V2)"
  //% blockHidden=true
  //% weight=80 help=datalogger/get-number-of-rows
  export function getNumberOfRows(fromRowIndex: number = 0): number {
      init();
      return flashlog.getNumberOfRows(fromRowIndex);
  }

  /**
   * Number of variable currently used by the datalogger, start counting at fromRowIndex
   * Treats the header as the first row
   * @param fromRowIndex 0-based index of start
   * @returns header + rows
   */
  //% block="get variable count"
  //% blockId=dataloggergetnumberofcolumns
  //% group="micro:bit (V2)"
  //% weight=98 help=datalogger/get-number-of-columns
  export function getNumberOfColumns(): number {
    init();

    let columnNames = flashlog.getRows(1, 1);

    if (columnNames.length == 0) return 0;

    let columnList = columnNames.split(",");
    return columnList.length;
  }


  /**
   * Get all rows seperated by a newline & each column seperated by a comma.
   * Starting at the 0-based index fromRowIndex & counting inclusively until nRows.
   * @param fromRowIndex 0-based index of start
   * @param nRows inclusive count from fromRowIndex
   * @returns String where newlines denote rows & commas denote columns
   */
  //% block="get rows $fromRowIndex $nRows"
  //% fromRowIndex.shadow=math_number
  //% nRows.shadow=math_number
  //% blockId=dataloggergetrows
  //% group="micro:bit (V2)"
  //% blockHidden=true
  //% weight=80 help=datalogger/get-rows
  export function getRows(fromRowIndex: number, nRows: number): string {
      init();
      return flashlog.getRows(fromRowIndex, nRows);
  }

  /**
   * Get data from flash storage
   * @param name Variable name; eg: "name1"
   * @returns The value associated with the variable name
   */
  //% block="get $name"
  //% fromName.shadow=datalogger_columnfield
  //% blockId=dataloggergetcolumn
  //% group="micro:bit (V2)"
  //% weight=99 help=datalogger/get-rows
  export function getData(name: string): string {
    if (!name) return ""; // Return empty string if name is null/empty
    
    init();

    // let columnNames = flashlog.getRows(1, 1);
    // if (columnNames.length == 0) return "-1"; // Return empty string if no data exists

    // let columnList = columnNames.split(",");
    // let index = columnList.indexOf(name);
    // if (index == -1) return "-1"; // Return empty string if variable not found
    
    // let datas = flashlog.getRows(1, 2).split(",");
    // return datas[index] .lenght|| "-1"; // Return the value or empty string if undefined
    let index = columnList.length;
    return flashlog.getRows(1, 2).split(",")[index-1];
}
}
