import { expect } from 'chai'
import ErrorStatusCodeMap from '../../../src/plugins/error-status-code-map'

const GLOBAL_ERROR_MAP = [
  {
    error: EvalError,
    status: 401
  },
  {
    error: ReferenceError,
    status: 500
  }
]

const SAMPLE_ERROR_MAP = [
  {
    error: TypeError,
    status: 400
  },
  {
    error: ReferenceError,
    status: 404
  }
]

describe('error-status-code map', () => {
  describe('when supplied with an error map', () => {
    let mapFn, req, res

    beforeEach(() => {
      req = {}
      res = {}
      const errorStatusCodeMap = new ErrorStatusCodeMap()
      mapFn = errorStatusCodeMap.errorMapper(SAMPLE_ERROR_MAP)
    })

    it('should correctly map the status to the response statusCode property', (done) => {
      mapFn(req, res, new ReferenceError('reference error'), null, () => {
        expect(res.statusCode).to.equal(404)

        mapFn(req, res, new TypeError('some error'), null, () => {
          expect(res.statusCode).to.equal(400)

          done()
        })
      })
    })

    it('should set the statusCode response property to 500 if the error does not match', (done) => {
      mapFn(req, res, new Error('some error'), null, () => {
        expect(res.statusCode).to.equal(500)
        done()
      })
    })
  })

  describe('when supplied with a global error status code map', () => {
    let req, res

    beforeEach(() => {
      req = {}
      res = {}
    })

    it('should make use of the global status codes if no local map supplied', (done) => {
      const errorStatusCodeMap = new ErrorStatusCodeMap(GLOBAL_ERROR_MAP)
      const mapFn = errorStatusCodeMap.errorMapper()

      mapFn(req, res, new EvalError('eval error'), null, () => {
        expect(res.statusCode).to.equal(401)
        done()
      })
    })

    it('should favour the local mapping status code instead of the global map when errors clash', (done) => {
      const errorStatusCodeMap = new ErrorStatusCodeMap(GLOBAL_ERROR_MAP)
      const mapFn = errorStatusCodeMap.errorMapper(SAMPLE_ERROR_MAP)

      mapFn(req, res, new ReferenceError('reference error'), null, () => {
        expect(res.statusCode).to.equal(404)
        done()
      })
    })
  })
})
