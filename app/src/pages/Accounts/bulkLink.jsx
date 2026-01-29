import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import * as XLSX from "xlsx";
import AucLnkFormat from "../../data/AucLnkFormat"
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../../redux/slices/snackbar';
import axiosInstance from '../../utilities/axiosInstance';

export default function BulkLinkDialog(props) {
  const dispatch = useDispatch();
  const [uploadedData, setUploadedData] = React.useState([]);
  const [responseAvailable, setResponseAvailable] = React.useState(false);
  const user = useSelector(state => state.auth.user);

  React.useEffect(() => {
    if (props.open) {
      setUploadedData([]); // Reset uploaded data when dialog opens
      setResponseAvailable(false)
    }
  }, [props.open]);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const fileType = file.type;
    const fileName = file.name;
  
    const isCSV = fileType === "text/csv" || fileName.endsWith(".csv");
    const isExcel =
      fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileName.endsWith(".xlsx");
  
    if (isCSV) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result.trim();
        const [headerLine, ...lines] = text.split("\n");
        const headers = headerLine.split(",").map(h => h.trim());
  
        const rows = lines.map(line => {
          const values = line.split(",").map(v => v.trim());
          return Object.fromEntries(headers.map((key, i) => [key, values[i]]));
        });
  
        setUploadedData(rows);
        console.log("CSV Data as objects:", rows);
      };
      reader.onerror = () => console.error("Error reading CSV file.");
      reader.readAsText(file);
    } else if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, {
              raw: false,
              cellDates: true
          }); // ← returns array of objects
          
          setUploadedData(rows);
          console.log("Excel Data as objects:", rows);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
        }
      };
      reader.onerror = () => console.error("Error reading Excel file.");
      reader.readAsArrayBuffer(file);
    } else {
      console.error("Unsupported file type. Please upload a CSV or Excel file.");
    }
  };


  const handleDownloadTemplate = (templateData, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    XLSX.writeFile(workbook, filename);
  }

  const normalizeDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) return value;
    if (typeof value === "number") return new Date(Math.round((value - 25569) * 86400 * 1000));

    const parsed = new Date(value);
    return isNaN(parsed) ? null : parsed;
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    let payload = uploadedData.map((row) => ({
      accountName: row.Account_Name,
      accountEmail: row.Account_Email,
      dateOfBirth: normalizeDate(row.Date_Of_Birth),
      phoneNumber: row.Phone_Number,
      employeeCode: row.Employee_Code,
      location: row.Location,
      anniversaryDate: normalizeDate(row.Anniversary_Date),
    }));  
    console.log("Payload to be sent:", payload);
    
    try {
      const response = await axiosInstance.post('/account/bulk', { data: payload, user }).then(res => res.data);
      console.log(response);
      if(response.status == 200){
        setUploadedData(response.data);
        setResponseAvailable(true)
        dispatch(showSnackbar({ message: response.message, severity: 'success', }));
      }
      
    } catch (error) {
      let message = error.response.data.message
      dispatch(showSnackbar({ message, severity: 'error', }));
    }
  }



  const handleReset = () => {
    setUploadedData([]);
    setResponseAvailable(false);
    document.getElementById("file-upload").value = ""; // Reset file input
  }
  
  

  return (
    <React.Fragment>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const email = formJson.email;
              console.log(email);
              props.handleClose();
            },
          },
        }}
      >
        <DialogTitle>Bulk Upload</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To map the auction process, please upload a file that contains the auctionId and process Id in a structured format.
          </DialogContentText>

          

          <TextField margin="normal" id="file-upload" name="fileUpload" type="file" fullWidth inputProps={{ accept: ".csv, .xlsx" }}
            helperText="Please upload a CSV or Excel file." onChange={handleFileUpload}
          />
          

          {uploadedData.length > 0 ? (
            <div style={{ marginTop: '20px', maxHeight: "45vh", overflowX: "auto" }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(uploadedData[0]).map((header, index) => (
                      <th key={index} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} style={{ 
                          border: '1px solid #ddd', padding: '8px', 
                          color: cellIndex > 2 ? 
                            row.Upload_Status === "SAP Error" ? "darkred" : 
                            row.Upload_Status === "SAP Warning" ? "orange" : 
                            row.Upload_Status === "Success" ? "green" : "black" : "black" 
                          }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src="/upload-vector.png" alt="Bulk Link Illustration" width={250} />
          </div>}

        </DialogContent>
        <DialogActions style={{ padding: '16px' }}>
          {responseAvailable ? (<Button onClick={() => handleDownloadTemplate(uploadedData, "Account_Response.xlsx")}>Download Response</Button>) :
          uploadedData.length > 0 ? (<Button variant="contained" type="button" onClick={handleSubmit}>Link</Button>) : 
          (<Button onClick={() => handleDownloadTemplate(AucLnkFormat, "Account_Template.xlsx")}>Download Template</Button>)}

          <Button color="warning" type="button" onClick={handleReset}>Reset</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
