/*
OpenRailwayMap Copyright (C) 2014 Alexander Matheisen
This program comes with ABSOLUTELY NO WARRANTY.
This is free software, and you are welcome to redistribute it under certain conditions.
See https://github.com/rurseekatze/OpenRailwayMap for details.
*/


// returns details of a facility (station, junction, yard, ...) by it's $name, $uicref or $ref and an optional $operator
Facilityinfo = function(params)
{
	// check validity of params
	if ((params.ref == null && params.uicref == null && params.name == null) || (params.ref != null && params.ref.length == 0) || (params.name != null && params.name.length == 0) || (params.uicref != null && params.uicref.length != 7) || (params.uicref != null && isNaN(params.uicref)))
		return false;

	var prefix = configuration.prefix;
	
	var operator = (params.operator != null && params.operator.length > 0) ? "AND (LOWER(tags->'operator') LIKE LOWER('%"+params.operator+"%'))" : "";
	var uicref = params.uicref;
	
	if (params.uicref != null)
		var searchcondition = "LOWER(tags->'uic_ref') = LOWER('"+params.uicref+"')";
	else if (params.ref != null)
		var searchcondition = "LOWER(tags->'railway:ref') = LOWER('"+params.ref+"')";
	else if (params.name != null)
	{
		if (params.name.length < 4)
			var searchcondition = "(REPLACE(LOWER(tags->'name'), '-', ' ') = REPLACE(LOWER('"+params.name+"'), '-', ' ')) OR (REPLACE(LOWER(tags->'uic_name'), '-', ' ') = REPLACE(LOWER('"+params.name+"'), '-', ' '))";
		else
			var searchcondition = "(REPLACE(LOWER(tags->'name'), '-', ' ') LIKE REPLACE(LOWER('%"+params.name+"%'), '-', ' ')) OR (REPLACE(LOWER(tags->'uic_name'), '-', ' ') LIKE REPLACE(LOWER('%"+params.name+"%'), '-', ' '))";
	}

	return query = "\
					SELECT ST_X(foo.geom) AS lat, ST_Y(foo.geom) AS lon, foo.name AS name, foo.uicname AS uicname, foo.uicref AS uicref, foo.ref AS ref, foo.id AS id, foo.type AS type, foo.operator AS operator \
					FROM \
					( \
						SELECT ST_Transform(way, 4326) AS geom, tags->'name' AS name, tags->'uic_name' AS uicname, tags->'uic_ref' AS uicref, tags->'railway:ref' AS ref, tags->'railway' AS type, tags->'operator' AS operator, osm_id AS id \
						FROM "+prefix+"_point \
						WHERE ("+searchcondition+") AND ((tags->'railway'='station') OR (tags->'railway'='halt') OR (tags->'railway'='junction') OR (tags->'railway'='yard') OR (tags->'railway'='crossover') OR (tags->'railway'='site') OR (tags->'railway'='service_station') OR (tags->'railway'='tram_stop')) "+operator+" \
					) AS foo \
					ORDER BY CHAR_LENGTH(foo.name), foo.name;";
};

module.exports = Facilityinfo;
