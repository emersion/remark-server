#!/usr/bin/env node

const http = require('http')
const fs = require('fs')
const stream = require('stream')

const serveStatic = require('serve-static')
const SpliceStream = require('streams2-splice')
const MultiStream = require('multistream')

const sourcePath = process.argv[2] || 'index.md'
if (!fs.existsSync(sourcePath)) {
	console.log(sourcePath + ' doesn\'t exist')
	process.exit(1)
}

const templatePath = require.resolve('remark/boilerplate-single.html')

const serve = serveStatic('.')

const server = http.createServer((req, res) => {
	serve(req, res, () => {
		const template = fs.createReadStream(templatePath)

		const splice = new SpliceStream('<textarea id="source">', '</textarea>', (s) => {
			return new stream.Readable().wrap(new MultiStream([
				stringStream('<textarea id="source">'),
				fs.createReadStream(sourcePath),
				stringStream('</textarea>')
			]))
		})

		template.pipe(splice).pipe(res)
	})
})

server.listen(process.env.PORT || 3000, () => {
	console.log('Server listening on http://localhost:' + server.address().port)
})

function stringStream(str) {
	const s = stream.Readable()
	s.push(str)
	s.push(null) // Indicates EOF
	return s
}
