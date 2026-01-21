export const DataGridStyle = {
    '& .MuiDataGrid-columnHeaders': {
        // backgroundColor: "white",
        // zIndex: 10,
    },
    '& .MuiDataGrid-cell[data-field="actions"]': {
        position: 'absolute',
        right: 0,
        zIndex: 10,
        backgroundColor: "white",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        // boxShadow: "2px 2px 2px lightgray"
    },
    '& .MuiDataGrid-columnHeader[data-field="actions"]': {
        position: 'absolute',
        right: 0,
        zIndex: 10,
        height: '100%',
        backgroundColor: "white"
    },
}