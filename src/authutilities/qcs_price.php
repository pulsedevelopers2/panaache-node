 <!doctype html>
<html>
<head>
    
            <script>
                var loadFile = function(event) {
                //   var output = document.getElementById('output');
                //   output.src = URL.createObjectURL(event.target.files[0]);
                //   output.onload = function() {
                //     URL.revokeObjectURL(output.src) // free memory
                //   }
                };
              </script>
              
              <meta content="width=device-width, initial-scale=1" name="viewport" >
              
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">

<!-- jQuery library -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

<!-- Latest compiled JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>

              
<style>
input[type=text],input[type=number], select {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

input[type=submit] {
  width: 100%;
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input[type=submit]:hover {
  background-color: #45a049;
}
input[type=file]{
    width:100%;
}
p,h2{
    text-align:center;
}
div {
  border-radius: 5px;
  background-color: #f2f2f2;
  padding: 20px;
}
img{
    width:100%;
}

.error{
    background-color:red;
}
</style>
</head>
<body>
<?php
	$servername = "localhost";
    $username = "u386445862_panaache";
    $password = "Panaache@123dev";
    $dbname = "u386445862_panaache";
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
$sql = mysqli_query($conn, "SELECT * from d_quality");
?>
        <form action="upload.php" method="post" enctype="multipart/form-data">
            <br>
            <?php if (isset($_GET['value'])) { 
            if ($_GET['value'] == 'Success') {?>
            <p class="alert alert-success"> Successfully Uploaded! </p><br>
            <?php } else { ?>
             <p class="alert alert-success error">Error Uploading Data</p><br>
             <?php } 
             }?>

            <div class="col-md-8 col-md-offset-2 col-sm-offset-2 col-sm-10">
            
<label >Quality</label>
 <select name="quality">
 
 <option>Select Quality</option>
 
<?php
$res = mysqli_query($conn, "SELECT quality FROM d_quality order by 1;" );
while($row = mysqli_fetch_array($res)) 
    echo "<option value='" . $row['quality']. "'>" . $row['quality'] . "</option>";
?>
 </select>

<label >Color</label>
 <select name="color">
 
 <option>Select Color</option>
 
<?php
$res = mysqli_query($conn, "SELECT color FROM d_color order by 1;" );
while($row = mysqli_fetch_array($res)) 
    echo "<option value='" . $row['color']. "'>" . $row['color'] . "</option>";
?>
 </select>

 <label >Size</label>
 <select name="size">
 
 <option>Select size</option>
 
<?php
$res = mysqli_query($conn, "SELECT size FROM d_size order by 1;" );
while($row = mysqli_fetch_array($res)) 
    echo "<option value='" . $row['size']. "'>" . $row['size'] . "</option>";
?>
 </select>
<input type = 'number' id='price' placeholder = 'Price' required>
<input type="submit" value="Submit" name="submit">
</div>
</form>
</body>
</html>
