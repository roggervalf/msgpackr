import { PackrStream, UnpackrStream } from '../node-index.js'
import stream from 'stream'
import chai from 'chai'
import util from 'util'
import fs from 'fs'
const finished = util.promisify(stream.finished)
var assert = chai.assert

suite('msgpackr node stream tests', function(){
	test('serialize/parse stream', () => {
		const serializeStream = new PackrStream({
		})
		const parseStream = new UnpackrStream()
		serializeStream.pipe(parseStream)
		const received = []
		parseStream.on('data', data => {
			received.push(data)
		})
		const messages = [{
			name: 'first'
		}, {
			name: 'second'
		}, {
			name: 'third'
		}, {
			name: 'third',
			extra: [1, 3, { foo: 'hi'}, 'bye']
		}]
		for (const message of messages)
			serializeStream.write(message)
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				assert.deepEqual(received, messages)
				resolve()
			}, 10)
		})
	})
	test('stream from buffer', () => new Promise(async resolve => {
		const parseStream = new UnpackrStream()
		let values = []
		parseStream.on('data', (value) => {
			values.push(value)
		})
		parseStream.on('end', () => {
			assert.deepEqual(values, [1, 2])
			resolve()
		})
		let bufferStream = new stream.Duplex()
		bufferStream.pipe(parseStream)
		bufferStream.push(new Uint8Array([1, 2]))
		bufferStream.push(null)
	}))
	test('serialize stream to file', async function() {
		const serializeStream = new PackrStream({
		})
		const fileStream = fs.createWriteStream('test-output.msgpack');
		serializeStream.pipe(fileStream);
		const messages = [{
			name: 'first'
		}, {
			name: 'second',
			extra: [1, 3, { foo: 'hi'}, 'bye']
		}]
		for (const message of messages)
			serializeStream.write(message)
		setTimeout(() => serializeStream.end(), 10)
		
		await finished(serializeStream)
	})
	teardown(function() {
		try {
			fs.unlinkSync('test-output.msgpack')
		}catch(error){}
	})
})

